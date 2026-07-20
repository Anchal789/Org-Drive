import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { getApiSession } from '@/lib/session';
import { decrypt } from '@/lib/utils';
import { bookmarkRepository } from '@/repositories/bookmark.repository';

export async function POST(request: NextRequest) {
  const session = await getApiSession(request);

  if (!session?.userId) return sendError('Unauthorized', 401);
  const { id, isFile, bookmark, shared, pathName } = await request.json();

  if (!id) {
    return sendError('Missing id', 400);
  }
  try {
    const response = await bookmarkRepository.bookmarkItem(
      Number(decrypt(id)),
      isFile,
      bookmark,
      shared,
    );

    if (!response) {
      return sendError('Failed to bookmark item', 500);
    }

    revalidatePath(pathName);
    return sendSuccess(
      null,
      `${isFile ? 'File' : 'Folder'} ${bookmark ? 'bookmarked' : 'unbookmarked'}`,
      200,
    );
  } catch (error) {
    if (error instanceof Error) {
      return sendError(error.message, 500);
    }
  }
}
