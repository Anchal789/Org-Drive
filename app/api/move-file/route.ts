import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { requireApiSession } from '@/lib/require-auth';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.repository';
import { uploadedFoldersRepository } from '@/repositories/uploaded-folders.repository';

export async function POST(request: NextRequest) {
  const session = await requireApiSession(request);
  if (session instanceof NextResponse) return session;

  const { filesId, folderId, pathName } = await request.json();

  if (!filesId || filesId.length === 0) {
    return sendError('Missing filesId or folderId', 400);
  }

  const actorId = Number(session.userId);

  if (folderId) {
    const targetFolder = await uploadedFoldersRepository.getAccessibleFolder(
      actorId,
      Number(folderId),
    );
    if (!targetFolder) {
      return sendError('Folder not found', 404);
    }
  }

  try {
    const response = await uploadedFilesRepository.moveFiles(
      filesId,
      folderId,
      actorId,
    );

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
    return sendError('Internal Server Error', 500);
  }
}
