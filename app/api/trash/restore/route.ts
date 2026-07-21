import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { requireApiSession } from '@/lib/require-auth';
import { trashedItemsRepository } from '@/repositories/trashed-items.repository';

export async function POST(request: NextRequest) {
  const user = await requireApiSession(request);
  if (user instanceof NextResponse) return user;

  const { id } = await request.json();

  if (!id) {
    return sendError('Missing id', 400);
  }

  const response = await trashedItemsRepository.restoreTrashItem(
    Number(user?.userId),
    Number(id),
  );

  if (!response) {
    return sendError('Failed to restore item', 500);
  }

  return sendSuccess(null, 'Item restored successfully', 200);
}
