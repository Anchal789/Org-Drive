import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { getApiSession } from '@/lib/session';
import { decrypt } from '@/lib/utils';
import { sharedWithMeRepository } from '@/repositories/shared-with-me.repository';

interface RemoveUserAccessBody {
  id: string;
}

export async function POST(request: NextRequest) {
  const [{ id }, session] = await Promise.all([
    request.json() as Promise<RemoveUserAccessBody>,
    getApiSession(request),
  ]);

  if (!session?.userId) return sendError('Unauthorized', 401);

  const decryptedId = decrypt(id);

  if (!decryptedId) {
    return sendError('Missing id', 400);
  }

  try {
    const response = await sharedWithMeRepository.deleteSharedItem(
      Number(decryptedId),
    );

    if (!response) {
      return sendError('Failed to remove access', 500);
    }
    return sendSuccess(null, 'Access removed successfully', 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(error.message, 500);
    }
  }
}
