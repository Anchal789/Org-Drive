import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { getApiSession } from '@/lib/session';
import { decrypt } from '@/lib/utils';
import { trashedItemsRepository } from '@/repositories/trashed-items.repository';

export async function POST(request: NextRequest) {
  const user = await getApiSession(request);

  if (!user?.userId) {
    return sendError('Access token missing or expired', 401);
  }
  const { id } = await request.json();

  if (!id) {
    return sendError('Missing id', 400);
  }

  const decryptedId = decrypt(id);

  if (!decryptedId) {
    return sendError('Invalid id', 400);
  }

  const response = await trashedItemsRepository.restoreTrashItem(
    Number(user?.userId),
    Number(decryptedId),
  );

  if (!response) {
    return sendError('Failed to restore item', 500);
  }

  return sendSuccess(null, 'Item restored successfully', 200);
}
