import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { requireApiSession } from '@/lib/require-auth';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.repository';

export async function POST(request: NextRequest) {
  const user = await requireApiSession(request);
  if (user instanceof NextResponse) return user;

  const { id, newName: rawNewName, pathName } = await request.json();
  const newName = typeof rawNewName === 'string' ? rawNewName.trim() : '';

  if (!id) return sendError('Missing id', 400);
  if (!newName) return sendError('Name cannot be empty', 400);
  if (newName.length > 255) {
    return sendError('File name must be 255 characters or fewer', 400);
  }

  const actorId = Number(user.userId);

  try {
    const response = await uploadedFilesRepository.renameFile(
      Number(id),
      newName,
      actorId,
    );

    if (!response) {
      return sendError('Failed to rename item', 500);
    }

    if (pathName) {
      revalidatePath(pathName);
    }

    return sendSuccess(null, 'File renamed successfully', 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(error.message, 500);
    }
    return sendError('Internal Server Error', 500);
  }
}
