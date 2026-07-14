export const dynamic = 'force-dynamic';

import { PassThrough, Readable } from 'node:stream';
import { ZipArchive as Archiver } from 'archiver';
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
  const folderId =
    decrypt(searchParams.get('folderId') || '') || searchParams.get('ids');
  const folderName = searchParams.get('folderName') || 'folder';

  if (!session?.userId && !searchParams.get('ids'))
    return sendError('Unauthorized', 401);
  if (!folderId) return sendError('Missing folderId', 400);

  const filesInFolder = (await uploadedFilesRepository.getFilesInFolder(
    Number(folderId),
  )) as Array<UploadedFile>;

  if (!filesInFolder || filesInFolder.length === 0) {
    return sendError('Folder is empty or not found', 404);
  }

  const actorId = Number(session?.userId || searchParams.get('userId'));
  const ownerId = Number(filesInFolder[0].userId);

  const logs = [
    {
      userId: actorId,
      fileId: Number(folderId),
      folderId: Number(folderId),
      action: 'downloaded',
      actionBy: actorId,
    },
  ];

  if (actorId !== ownerId) {
    logs.push({
      userId: ownerId,
      fileId: Number(folderId),
      folderId: Number(folderId),
      action: 'downloaded',
      actionBy: actorId,
    });
  }

  await db
    .insert(recentTable)
    .values(logs)
    .catch((err) => {
      void err;
    });

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
    const archive = new Archiver({ zlib: { level: 0 } });
    const passThrough = new PassThrough();
    archive.pipe(passThrough);

    (async () => {
      try {
        for (const fileInfo of filesInFolder) {
          if (!fileInfo.telegramMessageId) continue;

          const messages = await client?.getMessages(targetEntity, {
            ids: [Number(fileInfo.telegramMessageId)],
          });
          if (!messages) continue;

          const message = messages?.[0];
          if (!message?.media || !('document' in message.media)) continue;

          const chunkIterator = client?.iterDownload({
            file: message.media,
            requestSize: 1024 * 1024,
          });

          const fileNodeStream = Readable.from(chunkIterator);

          archive.append(fileNodeStream, {
            name: fileInfo.name || 'unknown-file',
          });
        }

        await archive.finalize();
      } catch (err) {
        void err;
        archive.abort();
      } finally {
        if (client)
          await client.disconnect().catch(() => {
            void 0;
          });
      }
    })();

    const webStream = new ReadableStream({
      start(controller) {
        passThrough.on('data', (chunk) => controller.enqueue(chunk));
        passThrough.on('end', () => controller.close());
        passThrough.on('error', (err) => controller.error(err));
      },
    });

    return new Response(webStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(folderName)}.zip"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: unknown) {
    if (client)
      await client.disconnect().catch(() => {
        void 0;
      });
    if (
      error instanceof Error &&
      error.message?.includes('AUTH_KEY_UNREGISTERED')
    ) {
      return sendError('Telegram session expired.', 401);
    }
    return sendError('Failed to initiate folder stream', 500);
  }
}
