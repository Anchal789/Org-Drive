'use server';

import { getSessionUser } from '@/lib/session';
import { sharedWithMeRepository } from '@/repositories/shared-with-me.repository';
import type { ShareWithMePerson } from '@/types/share-with-me';

export async function getUsersWithAccessAction(
  id: number,
  userId: number,
): Promise<Array<ShareWithMePerson>> {
  const user = await getSessionUser();
  if (!user?.userId) {
    throw new Error('Unauthorized');
  }
  const response = await sharedWithMeRepository.getUsersWithFileAccess(
    id,
    userId,
  );
  return response as Array<ShareWithMePerson>;
}
