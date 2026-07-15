'use server';

import { isTelegramSessionValid } from '@/lib/session';

export async function checkTelegramSessionValidAction() {
  return await isTelegramSessionValid();
}
