export const dynamic = "force-dynamic";

import { and, eq } from "drizzle-orm";
import fs from "fs/promises";
import { type NextRequest, NextResponse } from "next/server";
import os from "os";
import path from "path";
import { type Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { db } from "@/db";
import { uploadFoldersTable } from "@/db/schema";
import { sendError } from "@/lib/api-response";
import { getSessionUser } from "@/lib/session";
import { uploadedFilesRepository } from "@/repositories/uploaded-files.respository";
import { systemSettingsRepository } from "@/repositories/system-settings.repository";
import type { UploadFilesResponse } from "@/types/files";

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);
const STORAGE_CHANNEL = String(process.env.TELEGRAM_STORAGE_CHANNEL_ID);

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session?.userId) return sendError("Unauthorized", 401);

    const formData = await request.formData();
    const files = formData.getAll("file") as Array<File>;
    const folderName = formData.get("folderName") as string | null;
    const fileCount = formData.get("fileCount") as number | null;

    if (!files || files.length === 0)
      return sendError("No files uploaded", 400);

    let resolvedFolderId: number | null = null;

    if (folderName) {
      const existingFolder = await db
        .select()
        .from(uploadFoldersTable)
        .where(
          and(
            eq(uploadFoldersTable.name, folderName),
            eq(uploadFoldersTable.userId, Number(session.userId)),
            eq(uploadFoldersTable.fileCount, Number(fileCount)),
          ),
        )
        .limit(1);

      if (existingFolder.length > 0) {
        resolvedFolderId = existingFolder[0].id;
      } else {
        const [newFolder] = await db
          .insert(uploadFoldersTable)
          .values({
            userId: Number(session.userId),
            name: folderName,
            fileCount: Number(fileCount),
          })
          .returning();
        resolvedFolderId = newFolder.id;
      }
    }

    const botSessionString =
      await systemSettingsRepository.getBotSessionString();
    if (!botSessionString) {
      return sendError("System error: Bot session is not configured.", 500);
    }

    const encoder = new TextEncoder();
    let client: TelegramClient | null = new TelegramClient(
      new StringSession(botSessionString),
      API_ID,
      API_HASH,
      { connectionRetries: 1 },
    );

    let targetEntity: Api.TypeEntityLike;

    try {
      await client.connect();

      let formattedChannelId = STORAGE_CHANNEL.trim();
      if (
        !formattedChannelId.startsWith("@") &&
        !formattedChannelId.startsWith("-100")
      ) {
        formattedChannelId = `-100${formattedChannelId}`;
      }
      targetEntity = await client.getEntity(formattedChannelId);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (client) await client.disconnect().catch(() => {});
      return sendError(
        `Bot authorization or channel mapping failed: ${errMsg}`,
        500,
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (type: string, payload: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`event: ${type}\n`));
          const data = JSON.stringify({ type, ...payload });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        };

        try {
          const uploadedFiles: Array<UploadFilesResponse & { userId: number }> =
            [];
          const totalFiles = files.length;

          for (const [index, file] of files.entries()) {
            const fileNumber = index + 1;

            sendEvent("file_start", {
              name: file.name,
              current: fileNumber,
              total: totalFiles,
            });

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
            const tempFilePath = path.join(
              os.tmpdir(),
              `${Date.now()}-${safeName}`,
            );
            await fs.writeFile(tempFilePath, buffer);

            if (file.size === 0) {
              throw new Error("Telegram does not allow uploading empty files.");
            }

            try {
              let lastReportedPercentage = -1;
              const startTime = Date.now();
              const optimalWorkers = file.size > 10 * 1024 * 1024 ? 4 : 1;

              const message = await client?.sendFile(targetEntity, {
                file: tempFilePath,
                forceDocument: true,
                workers: optimalWorkers,
                progressCallback: (progress: number) => {
                  const currentPercentage = Math.round(progress * 100);
                  if (currentPercentage !== lastReportedPercentage) {
                    const elapsedSeconds = (Date.now() - startTime) / 1000;
                    let etaSeconds = 0;

                    if (progress > 0) {
                      const totalEstimatedTime = elapsedSeconds / progress;
                      etaSeconds = Math.round(
                        totalEstimatedTime - elapsedSeconds,
                      );
                    }

                    sendEvent("progress", {
                      name: file.name,
                      percentage: currentPercentage,
                      eta: etaSeconds,
                    });
                    lastReportedPercentage = currentPercentage;
                  }
                },
              });

              if (
                !message ||
                !message.media ||
                !("document" in message.media)
              ) {
                throw new Error(`Telegram rejected file: ${file.name}`);
              }

              const document = message.media.document as Api.TypeDocument & {
                accessHash: string | bigint;
              };

              const newFileRecord = {
                userId: Number(session.userId),
                telegramMessageId: message.id,
                folderId: resolvedFolderId || undefined,
                documentId: document?.id.toString() || "",
                accessHash: document?.accessHash.toString(),
                name: file.name,
                size: file.size,
                mimeType: file.type,
              };

              uploadedFiles.push(newFileRecord);
              await uploadedFilesRepository.uploadFiles([newFileRecord]);
            } finally {
              await fs.unlink(tempFilePath).catch(() => {});
            }
          }

          sendEvent("complete", { uploadedFiles });
        } catch (err: unknown) {
          if (err instanceof Error) {
            sendEvent("error", { message: err.message });
          }
        } finally {
          if (client) await client.disconnect().catch(() => {});
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Encoding": "none",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return sendError(errMsg, 500);
  }
}
