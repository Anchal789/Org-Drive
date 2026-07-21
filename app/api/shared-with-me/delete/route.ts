import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { requireApiSession } from '@/lib/require-auth';
import { sharedWithMeRepository } from '@/repositories/shared-with-me.repository';

export async function DELETE(request: NextRequest) {
  const session = await requireApiSession(request);
  if (session instanceof NextResponse) return session;

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) return sendError('File not found', 400);

  try {
    const deletedItem = await sharedWithMeRepository.deleteSharedItem(
      Number(id),
      Number(session.userId),
    );

    if (!deletedItem) return sendError('Item not found', 400);
    return sendSuccess(null, 'Item moved to trash.', 200);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return sendError(errMsg, 500);
  }
}
