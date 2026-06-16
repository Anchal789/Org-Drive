import type { NextRequest } from 'next/server';
import { type Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { sendError } from '@/lib/api-response';
import { getSessionUser } from '@/lib/session';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.respository';
import { userRepository } from '@/repositories/user.repository';
import type { UploadedFile } from '@/types/files';

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);
const STORAGE_CHANNEL = String(process.env.TELEGRAM_STORAGE_CHANNEL_ID);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const session = await getSessionUser();

  const fileId = searchParams.get('fileId');

  const fileInfo = (
    await uploadedFilesRepository.getFile(
      Number(session?.userId),
      Number(fileId),
    )
  )[0] as UploadedFile;

  let client: TelegramClient | null = null;

  if (!session?.userId) return sendError('Unauthorized', 401);

  const dbUser = await userRepository.findById(Number(session.userId));
  if (!dbUser?.telegramSessionString) return sendError('Session invalid', 401);

  client = new TelegramClient(
    new StringSession(dbUser.telegramSessionString),
    API_ID,
    API_HASH,
    { connectionRetries: 1 },
  );

  try {
    await client.connect();
    await client.getDialogs({ limit: 20 });
  } catch (_error) {
    return sendError('Failed to connect to Telegram infrastructure', 500);
  }

  try {
    const messages = await client.getMessages(STORAGE_CHANNEL, {
      ids: [Number(fileInfo.telegramMessageId)],
    });

    const message = messages[0];
    if (!message || !message.media || !('document' in message.media)) {
      return sendError(
        'File missing or deleted from Telegram infrastructure',
        404,
      );
    }

    const document = message.media.document as Api.TypeDocument & {
      size: number;
    };
    const fileSize = Number(document?.size);
    const fileName = fileInfo?.name || 'downloaded-file';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const chunkIterator = client!.iterDownload({
            file: message.media,
            requestSize: 1024 * 1024,
          });

          for await (const chunk of chunkIterator) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (err) {
          controller.error(err);
          throw err;
        } finally {
          if (client) {
            await client.disconnect().catch(() => {});
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileSize.toString(),
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);

    if (client) {
      await client.disconnect().catch(() => {});
    }

    if (errMsg?.includes('AUTH_KEY_UNREGISTERED')) {
      return sendError('Telegram session expired. Please log in again.', 401);
    }

    return sendError('Failed to initiate file stream down', 500);
  }
}
