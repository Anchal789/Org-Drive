export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { sendError, sendSuccess } from '@/lib/api-response';
import { requireApiSession } from '@/lib/require-auth';
import { systemSettingsRepository } from '@/repositories/system-settings.repository';
import { trashedItemsRepository } from '@/repositories/trashed-items.repository';

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);
const STORAGE_CHANNEL = String(process.env.TELEGRAM_STORAGE_CHANNEL_ID);

export async function DELETE(request: NextRequest) {
  const session = await requireApiSession(request);
  if (session instanceof NextResponse) return session;

  const telegramMessageIds = await trashedItemsRepository.emptyTrash(
    Number(session.userId),
    true,
  );

  if (telegramMessageIds.length === 0) {
    await trashedItemsRepository.emptyTrash(Number(session.userId), false);
    return sendSuccess(null, 'Trash is already empty', 200);
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

  try {
    await client.connect();

    let formattedChannelId = STORAGE_CHANNEL.trim();
    if (
      !formattedChannelId.startsWith('@') &&
      !formattedChannelId.startsWith('-100')
    ) {
      formattedChannelId = `-100${formattedChannelId}`;
    }
    const targetEntity = await client.getEntity(formattedChannelId);

    await client.deleteMessages(targetEntity, telegramMessageIds, {
      revoke: true,
    });

    await trashedItemsRepository.emptyTrash(Number(session.userId), false);

    return sendSuccess(
      null,
      `Permanently deleted ${telegramMessageIds.length} items`,
      200,
    );
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg?.includes('AUTH_KEY_UNREGISTERED')) {
      return sendError('Telegram session expired.', 401);
    }
    return sendError(`Telegram Error: ${errMsg}. (Database protected)`, 500);
  } finally {
    if (client)
      await client.disconnect().catch(() => {
        void 0;
      });
  }
}
