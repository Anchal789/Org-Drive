'use server';

import { sharedWithMeRepository } from '@/repositories/shared-with-me.repository';
import type { ShareWithMePerson } from '@/types/share-with-me';

export async function getUsersWithAccessAction(
  id: number,
  userId: number,
): Promise<Array<ShareWithMePerson>> {
  const response = await sharedWithMeRepository.getUsersWithFileAccess(
    id,
    userId,
  );
  return response as Array<ShareWithMePerson>;
}
