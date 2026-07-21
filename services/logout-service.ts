'use server';

import { redirect } from 'next/navigation';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { logoutAction } from '@/actions/auth-actions';
import { logger } from '@/lib/logger';
import { getSessionUser } from '@/lib/session';
import { userRepository } from '@/repositories/user.repository';
import type { SessionUser } from './../types/auth';

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);

export async function logoutUser(user: SessionUser) {
  const session = await getSessionUser();
  if (!session?.userId || String(session.userId) !== String(user?.userId)) {
    throw new Error('Unauthorized');
  }
  const userTelegramString = await userRepository.findById(
    Number(session.userId),
  );

  const SESSION_STRING = userTelegramString?.telegramSessionString;

  const client = new TelegramClient(
    new StringSession(SESSION_STRING),
    API_ID,
    API_HASH,
    {
      connectionRetries: 5,
    },
  );

  try {
    await client.connect();
    await client.invoke(new Api.auth.LogOut());
  } catch (error) {
    logger.warn(
      'Telegram LogOut call failed; local session will still be cleared',
      {
        userId: session.userId,
        error: error instanceof Error ? error.message : String(error),
      },
    );
  } finally {
    await client.disconnect();
  }

  await logoutAction();

  redirect('/login');
}
