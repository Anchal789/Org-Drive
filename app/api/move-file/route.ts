import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { getApiSession } from '@/lib/session';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.respository';

export async function POST(request: NextRequest) {
  const session = await getApiSession(request);

  if (!session?.userId) return sendError('Unauthorized', 401);
  const { filesId, folderId, pathName } = await request.json();

  if (!filesId || filesId.length === 0) {
    return sendError('Missing filesId or folderId', 400);
  }

  try {
    const response = await uploadedFilesRepository.moveFiles(filesId, folderId);

    if (!response) {
      return sendError('Failed to move files', 500);
    }

    if (pathName) {
      revalidatePath(pathName);
    }
    return sendSuccess(null, 'Files moved successfully', 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(error.message, 500);
    }
  }
}
