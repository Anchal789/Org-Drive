export const dynamic = 'force-dynamic';

import { type Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { sendSuccess } from '@/lib/api-response';
import { trashedItemsRepository } from '@/repositories/trashed-items.repository';
import { userRepository } from '@/repositories/user.repository';

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);
const STORAGE_CHANNEL = String(process.env.TELEGRAM_STORAGE_CHANNEL_ID);

export async function GET(request: Request) {
  if (!process.env.NEXT_PRIVATE_CRON_SECRET) {
    return new Response('Cron secret is not configured', { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.NEXT_PRIVATE_CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const usersToSweep = await trashedItemsRepository.getUsersWithExpiredTrash();
  let totalDeletedFiles = 0;

  for (const userId of usersToSweep) {
    const dbUser = await userRepository.findById(userId);
    if (!dbUser?.telegramSessionString) continue;

    // Dry run: resolve which Telegram messages this sweep would delete
    // without touching the DB yet, so a failed Telegram delete can't
    // orphan storage with no DB record left to retry against.
    const telegramMessageIds =
      await trashedItemsRepository.processExpiredTrashForUser(userId, true);

    if (telegramMessageIds.length === 0) {
      // Nothing tied to Telegram media (e.g. an empty folder trash entry) —
      // safe to commit the DB delete immediately.
      await trashedItemsRepository.processExpiredTrashForUser(userId, false);
      continue;
    }

    const client: TelegramClient | null = new TelegramClient(
      new StringSession(''),
      API_ID,
      API_HASH,
      {
        connectionRetries: 1,
      },
    );

    let targetEntity: Api.TypeEntityLike;

    try {
      await client.start({
        botAuthToken: process.env.TELEGRAM_BOT_TOKEN as string,
      });
      const formattedChannelId = STORAGE_CHANNEL.trim();
      targetEntity = await client.getEntity(formattedChannelId);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(
        `[cron/sweep-trash] Bot authorization or channel mapping failed for user ${userId}:`,
        errMsg,
      );
      if (client)
        await client.disconnect().catch(() => {
          void 0;
        });
      continue;
    }

    try {
      await client.connect();

      await client.deleteMessages(targetEntity, telegramMessageIds, {
        revoke: true,
      });

      // Telegram deletion confirmed — now it's safe to commit the DB delete.
      await trashedItemsRepository.processExpiredTrashForUser(userId, false);
      totalDeletedFiles += telegramMessageIds.length;
    } catch (error) {
      console.error(
        `[cron/sweep-trash] Telegram deletion failed for user ${userId}, DB rows preserved for retry:`,
        error,
      );
    } finally {
      await client.disconnect().catch(() => {
        void 0;
      });
    }
  }

  return sendSuccess(
    { usersSwept: usersToSweep.length, filesPermanentlyDeleted: totalDeletedFiles },
    'Trash sweep completed',
    200,
  );
}
