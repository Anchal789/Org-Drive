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

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);
const STORAGE_CHANNEL = String(process.env.TELEGRAM_STORAGE_CHANNEL_ID);

async function resolveFilesAccess(
  request: NextRequest,
): Promise<{ fileIds: number[]; actorId: number | null } | null> {
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
      if (payload.type !== 'multi' && payload.type !== 'file') return null;
      const fileIds = (payload.ids ?? []).map(Number).filter(Boolean);
      if (fileIds.length === 0) return null;
      return { fileIds, actorId: null };
    } catch {
      return null;
    }
  }

  const session = await getSessionUser();
  if (!session?.userId) return null;

  const idsParam = searchParams.get('ids');
  if (!idsParam) return null;
  const fileIds = idsParam.split(',').map(Number).filter(Boolean);
  if (fileIds.length === 0) return null;

  return { fileIds, actorId: Number(session.userId) };
}

export async function POST(request: NextRequest) {
  const access = await resolveFilesAccess(request);
  if (!access) return sendError('Unauthorized', 401);

  const filesInfo = access.actorId
    ? await uploadedFilesRepository.getAccessibleFilesByIds(
        access.actorId,
        access.fileIds,
      )
    : await uploadedFilesRepository.getFilesByIds(access.fileIds);

  if (filesInfo.length === 0) return sendError('No files found', 404);

  const actorId = access.actorId ?? Number(filesInfo[0].userId);
  const logs: Array<{
    userId: number;
    fileId: number;
    folderId: number | null;
    action: string;
    actionBy: number;
  }> = [];
  const messageIdsToFetch: number[] = [];

  for (const file of filesInfo) {
    messageIdsToFetch.push(Number(file.telegramMessageId));

    logs.push({
      userId: actorId,
      fileId: Number(file.id),
      folderId: Number(file.folderId),
      action: 'downloaded',
      actionBy: actorId,
    });

    if (actorId !== Number(file.userId)) {
      logs.push({
        userId: Number(file.userId),
        fileId: Number(file.id),
        folderId: Number(file.folderId),
        action: 'downloaded',
        actionBy: actorId,
      });
    }
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
    return sendError(`Bot connection failed: ${errMsg}`, 500);
  }

  try {
    const messages = await client.getMessages(targetEntity, {
      ids: messageIdsToFetch,
    });
    const messagesById = new Map(
      messages.map((m) => [Number(m.id), m] as const),
    );

    const hasAnyValidFile = filesInfo.some((fileInfo) => {
      const msg = messagesById.get(Number(fileInfo.telegramMessageId));
      return !!msg?.media && 'document' in msg.media;
    });

    if (!hasAnyValidFile) {
      await client.disconnect().catch(() => {
        void 0;
      });
      return sendError(
        'None of the requested files could be found in storage',
        404,
      );
    }

    const archive = new Archiver({ zlib: { level: 0 } });
    const passThrough = new PassThrough();

    archive.pipe(passThrough);

    (async () => {
      try {
        const usedNames = new Set<string>();

        for (const fileInfo of filesInfo) {
          const msg = messagesById.get(Number(fileInfo.telegramMessageId));
          if (!msg?.media || !('document' in msg.media)) continue;

          let fileName = fileInfo.name || 'downloaded-file';
          let counter = 1;
          while (usedNames.has(fileName)) {
            const parts = fileName.split('.');
            const ext = parts.length > 1 ? `.${parts.pop()}` : '';
            fileName = `${parts.join('.')} (${counter})${ext}`;
            counter++;
          }
          usedNames.add(fileName);

          if (!client) continue;
          const chunkIterator = client.iterDownload({
            file: msg.media,
            requestSize: 1024 * 1024,
          });

          const tgStream = Readable.from(chunkIterator);

          archive.append(tgStream, { name: fileName });
        }
        await archive.finalize();
      } catch (err) {
        logger.error('Multi-file zip archive failed mid-stream', {
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
      cancel() {
        archive.abort();
        if (client)
          client.disconnect().catch(() => {
            void 0;
          });
      },
    });

    db.insert(recentTable)
      .values(logs)
      .catch((err) => {
        logger.warn('Failed to record recent-activity log for zip download', {
          error: err instanceof Error ? err.message : String(err),
        });
      });

    return new Response(webStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="Drive_Downloads.zip"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch {
    if (client)
      await client.disconnect().catch(() => {
        void 0;
      });
    return sendError('Failed to initiate zip stream', 500);
  }
}
