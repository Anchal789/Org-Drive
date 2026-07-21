'use server';

import { encrypt } from '@/lib/crypto';
import { getSessionUser } from '@/lib/session';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.repository';
import { uploadedFoldersRepository } from '@/repositories/uploaded-folders.repository';

const SHARE_LINK_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createShareLinkToken(payload: {
  type: 'file' | 'multi' | 'folder';
  ids: number[];
  userId: number;
}) {
  const session = await getSessionUser();
  if (!session?.userId) {
    throw new Error('Unauthorized');
  }
  const actorId = Number(session.userId);

  if (!payload.ids || payload.ids.length === 0) {
    throw new Error('No items to share');
  }

  if (payload.type === 'folder') {
    const folder = await uploadedFoldersRepository.getAccessibleFolder(
      actorId,
      Number(payload.ids[0]),
    );
    if (!folder) {
      throw new Error('You do not have access to this folder');
    }
  } else {
    const accessibleFiles = await uploadedFilesRepository.getAccessibleFilesByIds(
      actorId,
      payload.ids.map(Number),
    );
    if (accessibleFiles.length !== payload.ids.length) {
      throw new Error('You do not have access to one or more selected files');
    }
  }

  const exp = Date.now() + SHARE_LINK_TTL_MS;
  return encrypt(JSON.stringify({ ...payload, exp }));
}
