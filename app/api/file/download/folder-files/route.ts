export const dynamic = 'force-dynamic';

import { PassThrough, Readable } from 'node:stream';
import { ZipArchive as Archiver } from 'archiver';
import type { NextRequest } from 'next/server';
import { type Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { db } from '@/db';
import { recentTable } from '@/db/schema';
import { sendError } from '@/lib/api-response';
import { decrypt } from '@/lib/crypto';
import { logger } from '@/lib/logger';
import { getSessionUser } from '@/lib/session';
import { systemSettingsRepository } from '@/repositories/system-settings.repository';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.repository';
import { uploadedFoldersRepository } from '@/repositories/uploaded-folders.repository';
import type { UploadedFile } from '@/types/files';

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);
const STORAGE_CHANNEL = String(process.env.TELEGRAM_STORAGE_CHANNEL_ID);

async function resolveFolderAccess(
  request: NextRequest,
): Promise<{ folderId: number; actorId: number | null } | null> {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token) {
    const decrypted = decrypt(token);
    if (!decrypted) return null;

    try {
      const payload = JSON.parse(decrypted) as {
        type?: string;
        ids?: number[];
        exp?: number;
      };
      if (!payload.exp || Date.now() > payload.exp) return null;
      if (payload.type !== 'folder') return null;
      const folderId = Number(payload.ids?.[0]);
      if (!folderId) return null;
      return { folderId, actorId: null };
    } catch {
      return null;
    }
  }

  const session = await getSessionUser();
  if (!session?.userId) return null;

  const folderId = Number(searchParams.get('folderId'));
  if (!folderId) return null;

  return { folderId, actorId: Number(session.userId) };
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const folderName = searchParams.get('folderName') || 'folder';

  const access = await resolveFolderAccess(request);
  if (!access) return sendError('Unauthorized', 401);

  if (access.actorId) {
    const folder = await uploadedFoldersRepository.getAccessibleFolder(
      access.actorId,
      access.folderId,
    );
    if (!folder) return sendError('Folder not found', 404);
  }

  const filesInFolder = (await uploadedFilesRepository.getFilesInFolder(
    access.folderId,
  )) as Array<UploadedFile>;

  if (!filesInFolder || filesInFolder.length === 0) {
    return sendError('Folder is empty or not found', 404);
  }

  const actorId = access.actorId ?? Number(filesInFolder[0].userId);
  const ownerId = Number(filesInFolder[0].userId);

  const logs = [
    {
      userId: actorId,
      fileId: Number(access.folderId),
      folderId: Number(access.folderId),
      action: 'downloaded',
      actionBy: actorId,
    },
  ];

  if (actorId !== ownerId) {
    logs.push({
      userId: ownerId,
      fileId: Number(access.folderId),
      folderId: Number(access.folderId),
      action: 'downloaded',
      actionBy: actorId,
    });
  }

  await db
    .insert(recentTable)
    .values(logs)
    .catch((err) => {
      logger.warn('Failed to record recent-activity log for folder download', {
        error: err instanceof Error ? err.message : String(err),
      });
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
    // Resolve all messages in a single batched call (matches the safer
    // pattern already used by the multi-file download route) instead of
    // firing one fully-concurrent Telegram API call per file, which risks
    // FLOOD_WAIT on large folders.
    const messageIdsToFetch = filesInFolder
      .map((f) => Number(f.telegramMessageId))
      .filter(Boolean);

    const messages = await client.getMessages(targetEntity, {
      ids: messageIdsToFetch,
    });
    const messagesById = new Map(messages.map((m) => [Number(m.id), m]));

    const resolvedFiles = filesInFolder
      .map((fileInfo) => {
        const message = messagesById.get(Number(fileInfo.telegramMessageId));
        if (!message?.media || !('document' in message.media)) return null;
        return { fileInfo, message };
      })
      .filter((resolved): resolved is NonNullable<typeof resolved> =>
        Boolean(resolved),
      );

    if (resolvedFiles.length === 0) {
      await client.disconnect().catch(() => {
        void 0;
      });
      return sendError(
        'None of the files in this folder could be found in storage',
        404,
      );
    }

    const archive = new Archiver({ zlib: { level: 0 } });
    const passThrough = new PassThrough();
    archive.pipe(passThrough);

    (async () => {
      try {
        for (const resolved of resolvedFiles) {
          const chunkIterator = client?.iterDownload({
            file: resolved.message.media,
            requestSize: 1024 * 1024,
          });

          const fileNodeStream = Readable.from(chunkIterator);

          archive.append(fileNodeStream, {
            name: resolved.fileInfo.name || 'unknown-file',
          });
        }

        await archive.finalize();
      } catch (err) {
        logger.error('Folder zip archive failed mid-stream', {
          error: err instanceof Error ? err.message : String(err),
        });
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
