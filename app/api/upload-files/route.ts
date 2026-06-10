import { NextRequest } from "next/server";
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { CustomFile } from "telegram/client/uploads";
import { sendError, sendSuccess } from "@/lib/api-response";
import { getSessionUserId } from "@/lib/session";
import { userRepository } from "@/repositories/user.repository";

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);
const STORAGE_CHANNEL = String(process.env.TELEGRAM_STORAGE_CHANNEL_ID);

export async function POST(request: NextRequest) {
  let client: TelegramClient | null = null;

  try {
    const session = await getSessionUserId();
    if (!session?.userId) {
      return sendError("Unauthorized", 401);
    }

    const dbUser = await userRepository.findById(Number(session.userId));

    if (!dbUser?.telegramSessionString) {
      return sendError("Telegram session expired or invalid", 401);
    }

    const formData = await request.formData();
    const files = formData.getAll("file") as Array<File>;

    if (!files) {
      return sendError("No files uploaded", 400);
    }

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

    // Note: We use a loop here because converting multiple massive files
    // into Buffers concurrently can crash your node process with Out-Of-Memory errors.

    const uploadedFiles = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const customFile = new CustomFile(
        file.name,
        file.size,
        file.type,
        buffer,
      );
      const message = await client.sendFile(STORAGE_CHANNEL, {
        file: customFile,
        forceDocument: true,
        workers: 4,
      });

      if (!message || !message.media || !("document" in message.media)) {
        return sendError(
          `Failed to verify upload on Telegram for file: ${file.name}`,
          500,
        );
      }

      const document = message.media.document;

      uploadedFiles.push({
        telegramMessageId: message.id,
        documentId: document?.id.toString(),
        accessHash: document?.accessHash.toString(),
        name: file.name,
        size: file.size,
        mimeType: file.type,
      });
    }

    return sendSuccess(
      uploadedFiles,
      "All files uploaded successfully to MTProto",
    );
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return sendError(errMsg, 500);
  } finally {
    if (client) {
      await client.disconnect().catch(() => {});
    }
  }
}
