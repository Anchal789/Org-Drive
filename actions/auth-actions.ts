'use server';

import { destroySession, getSessionUser } from '@/lib/session';

export async function logoutAction() {
  const user = await getSessionUser();

  if (!user?.userId) {
    return { success: false };
  }
  await destroySession();
  return { success: true };
}
