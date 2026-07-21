import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { requireApiSession } from '@/lib/require-auth';
import { uploadedFoldersRepository } from '@/repositories/uploaded-folders.repository';

export async function POST(request: NextRequest) {
  const session = await requireApiSession(request);
  if (session instanceof NextResponse) return session;

  const { id, newName: rawNewName, pathName } = await request.json();
  const newName = typeof rawNewName === 'string' ? rawNewName.trim() : '';

  if (!id) {
    return sendError('Missing id', 400);
  }

  if (!newName) {
    return sendError('Name cannot be empty', 400);
  }

  if (newName.length > 255) {
    return sendError('Folder name must be 255 characters or fewer', 400);
  }

  try {
    const response = await uploadedFoldersRepository.renameFolder(
      Number(id),
      newName,
      Number(session.userId),
    );
    if (!response) {
      return sendError('Failed to rename item', 500);
    }

    if (pathName) {
      revalidatePath(pathName);
    }
    return sendSuccess(null, 'Folder renamed successfully', 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(error.message, 500);
    }
    return sendError('Internal Server Error', 500);
  }
}
