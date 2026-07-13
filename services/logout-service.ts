'use server';

import { redirect } from 'next/navigation';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { destroySession } from '@/lib/session';
import { userRepository } from '@/repositories/user.repository';
import type { SessionUser } from './../types/auth';

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);

export async function logoutUser(user: SessionUser) {
  const userTelegramString = await userRepository.findById(
    Number(user?.userId),
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
    void error;
  } finally {
    await client.disconnect();
  }

  await destroySession();

  redirect('/login');
}
