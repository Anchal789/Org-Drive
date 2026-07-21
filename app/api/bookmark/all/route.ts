import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { requireApiSession } from '@/lib/require-auth';
import { bookmarkRepository } from '@/repositories/bookmark.repository';

export async function POST(request: NextRequest) {
  const session = await requireApiSession(request);
  if (session instanceof NextResponse) return session;
  try {
    const { items, bookmarkState, pathName } = await request.json();

    if (!items || !Array.isArray(items)) {
      return sendError('Invalid payload', 400);
    }

    await bookmarkRepository.bookmarkMultipleItems(
      items,
      bookmarkState,
      Number(session.userId),
    );

    if (pathName) {
      revalidatePath(pathName);
    }
    return sendSuccess(
      null,
      `${items.length > 1 ? 'Items' : 'Item'} ${bookmarkState ? 'bookmarked' : 'unbookmarked'} successfully`,
      200,
    );
  } catch (error) {
    if (error instanceof Error) {
      return sendError(error.message, 500);
    }
    return sendError('An unknown error occurred', 500);
  }
}
