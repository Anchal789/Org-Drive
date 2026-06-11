export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { sendError } from "@/lib/api-response";
import { getSessionUser } from "@/lib/session";
import { userRepository } from "@/repositories/user.repository";

import fs from "fs/promises";
import path from "path";
import os from "os";
import { UploadFilesResponse } from "@/types/files";
import { uploadedFilesRepository } from "@/repositories/uploaded-files.respository";

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);
const STORAGE_CHANNEL = String(process.env.TELEGRAM_STORAGE_CHANNEL_ID);

export async function POST(request: NextRequest) {
  let client: TelegramClient | null = null;

  try {
    const session = await getSessionUser();
    if (!session?.userId) return sendError("Unauthorized", 401);

    const dbUser = await userRepository.findById(Number(session.userId));
    if (!dbUser?.telegramSessionString)
      return sendError("Session invalid", 401);

    const formData = await request.formData();
    const files = formData.getAll("file") as Array<File>;
    if (!files || files.length === 0)
      return sendError("No files uploaded", 400);

    const encoder = new TextEncoder();

    client = new TelegramClient(
      new StringSession(dbUser.telegramSessionString),
      API_ID,
      API_HASH,
      { connectionRetries: 5 },
    );

    try {
      await client.connect();
    } catch (_error) {
      return sendError("Failed to connect to Telegram infrastructure", 500);
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

            try {
              let lastReportedPercentage = -1;
              const startTime = Date.now();

              const message = await client?.sendFile(STORAGE_CHANNEL, {
                file: tempFilePath,
                forceDocument: true,
                workers: 4,
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
              uploadedFiles.push({
                userId: dbUser.id,
                telegramMessageId: message.id,
                documentId: document?.id.toString() || "",
                accessHash: document?.accessHash.toString(),
                name: file.name,
                size: file.size,
                mimeType: file.type,
              });
              await uploadedFilesRepository.uploadFiles(uploadedFiles);
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
