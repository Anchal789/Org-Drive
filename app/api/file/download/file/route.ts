import type { NextRequest } from 'next/server';
import { type Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { db } from '@/db';
import { recentTable } from '@/db/schema';
import { sendError } from '@/lib/api-response';
import { getSessionUser } from '@/lib/session';
import { decrypt } from '@/lib/utils';
import { systemSettingsRepository } from '@/repositories/system-settings.repository';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.respository';
import type { UploadedFile } from '@/types/files';

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);
const STORAGE_CHANNEL = String(process.env.TELEGRAM_STORAGE_CHANNEL_ID);

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const session = await getSessionUser();

  if (!session?.userId && !searchParams.get('fileId'))
    return sendError('Unauthorized', 401);

  const fileId =
    decrypt(searchParams.get('token') || '') || searchParams.get('fileId');
  const requestUserId = searchParams.get('userId');

  const fileInfo = (
    await uploadedFilesRepository.getFile(
      Number(requestUserId || session?.userId),
      Number(fileId),
    )
  )[0] as UploadedFile;

  if (!fileInfo) return sendError('File not found in database', 404);

  const actorId = Number(session?.userId || requestUserId);
  const ownerId = Number(fileInfo.userId);

  const logs = [
    {
      userId: actorId,
      fileId: Number(fileId),
      folderId: Number(fileInfo.folderId),
      action: 'downloaded',
      actionBy: actorId,
    },
  ];

  if (actorId !== ownerId) {
    logs.push({
      userId: ownerId,
      fileId: Number(fileId),
      folderId: Number(fileInfo.folderId),
      action: 'downloaded',
      actionBy: actorId,
    });
  }

  const botSessionString = await systemSettingsRepository.getBotSessionString();
  if (!botSessionString) {
    return sendError('System error: Bot session is not configured.', 500);
  }

  const client: TelegramClient | null = new TelegramClient(
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
      !formattedChannelId.startsWith('@') &&
      !formattedChannelId.startsWith('-100')
    ) {
      formattedChannelId = `-100${formattedChannelId}`;
    }
    targetEntity = await client.getEntity(formattedChannelId);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (client)
      await client.disconnect().catch(() => {
        void 0;
      });
    return sendError(
      `Bot connection or channel mapping failed: ${errMsg}`,
      500,
    );
  }

  try {
    const messages = await client.getMessages(targetEntity, {
      ids: [Number(fileInfo.telegramMessageId)],
    });

    const message = messages[0];
    if (!message?.media || !('document' in message.media)) {
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
          if (!client) throw new Error('Client not initialized');
          const chunkIterator = client.iterDownload({
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
            await client.disconnect().catch(() => {
              void 0;
            });
          }
        }
      },
    });

    await db
      .insert(recentTable)
      .values(logs)
      .catch((err) => {
        void err;
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
      await client.disconnect().catch(() => {
        void 0;
      });
    }

    if (errMsg?.includes('AUTH_KEY_UNREGISTERED')) {
      return sendError('Telegram session expired. Please log in again.', 401);
    }

    return sendError('Failed to initiate file stream down', 500);
  }
}
