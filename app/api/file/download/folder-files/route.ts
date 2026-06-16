export const dynamic = 'force-dynamic';

import { ZipArchive as Archiver } from 'archiver';
import type { NextRequest } from 'next/server';
import { PassThrough, Readable } from 'stream';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { sendError } from '@/lib/api-response';
import { getSessionUser } from '@/lib/session';
import { decrypt } from '@/lib/utils';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.respository';
import { userRepository } from '@/repositories/user.repository';
import type { UploadedFile } from '@/types/files';

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);
const STORAGE_CHANNEL = String(process.env.TELEGRAM_STORAGE_CHANNEL_ID);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const session = await getSessionUser();
  const folderId = decrypt(searchParams.get('folderId') || '');
  const folderName = searchParams.get('folderName') || 'folder';

  if (!session?.userId) return sendError('Unauthorized', 401);
  if (!folderId) return sendError('Missing folderId', 400);

  const filesInFolder = (await uploadedFilesRepository.getFilesInFolder(
    Number(session.userId),
    Number(folderId),
  )) as Array<UploadedFile>;

  if (!filesInFolder || filesInFolder.length === 0) {
    return sendError('Folder is empty or not found', 404);
  }

  const dbUser = await userRepository.findById(Number(session.userId));
  if (!dbUser?.telegramSessionString) return sendError('Session invalid', 401);

  const client: TelegramClient | null = new TelegramClient(
    new StringSession(dbUser.telegramSessionString),
    API_ID,
    API_HASH,
    { connectionRetries: 1 },
  );

  try {
    await client.connect();
    const archive = new Archiver({ zlib: { level: 0 } });
    const passThrough = new PassThrough();
    archive.pipe(passThrough);

    (async () => {
      try {
        for (const fileInfo of filesInFolder) {
          if (!fileInfo.telegramMessageId) continue;

          const messages = await client!.getMessages(STORAGE_CHANNEL, {
            ids: [Number(fileInfo.telegramMessageId)],
          });

          const message = messages[0];
          if (!message || !message.media || !('document' in message.media))
            continue;

          const chunkIterator = client!.iterDownload({
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
        console.error('Zipping process failed:', err);
        archive.abort();
      } finally {
        if (client) await client.disconnect().catch(() => {});
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
  } catch (error: any) {
    if (client) await client.disconnect().catch(() => {});
    if (error.message?.includes('AUTH_KEY_UNREGISTERED')) {
      return sendError('Telegram session expired.', 401);
    }
    return sendError('Failed to initiate folder stream', 500);
  }
}
