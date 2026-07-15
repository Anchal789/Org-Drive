'use server';

import { uploadedFoldersRepository } from '@/repositories/uploaded-folders.respository';
import { getSessionUser } from './session';

export async function fetchFolderFromFile(userId: number, id: number) {
  const user = await getSessionUser();
  if (!user?.userId) {
    throw new Error('Unauthorized');
  }
  const response = await uploadedFoldersRepository.getFolder(userId, id);
  return response;
}
