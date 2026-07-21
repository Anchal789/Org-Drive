import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { requireApiSession } from '@/lib/require-auth';
import { bookmarkRepository } from '@/repositories/bookmark.repository';

export async function POST(request: NextRequest) {
  const session = await requireApiSession(request);
  if (session instanceof NextResponse) return session;

  const { id, isFile, bookmark, shared, pathName } = await request.json();

  if (!id) {
    return sendError('Missing id', 400);
  }
  try {
    const response = await bookmarkRepository.bookmarkItem(
      Number(id),
      isFile,
      bookmark,
      shared,
      Number(session.userId),
    );

    if (!response) {
      return sendError('Failed to bookmark item', 500);
    }

    if (pathName) {
      revalidatePath(pathName);
    }

    return sendSuccess(
      null,
      `${isFile ? 'File' : 'Folder'} ${bookmark ? 'bookmarked' : 'unbookmarked'}`,
      200,
    );
  } catch (error) {
    if (error instanceof Error) {
      return sendError(error.message, 500);
    }
    return sendError('Internal Server Error', 500);
  }
}
