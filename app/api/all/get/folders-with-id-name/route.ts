import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { requireApiSession } from '@/lib/require-auth';
import { uploadedFoldersRepository } from '@/repositories/uploaded-folders.repository';

export async function GET(request: NextRequest) {
  const session = await requireApiSession(request);
  if (session instanceof NextResponse) return session;
  try {
    const folders = await uploadedFoldersRepository.getAllFoldersWithIdName(
      Number(session.userId),
    );
    return sendSuccess(folders, 'Folders fetched successfully', 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(error.message, 500);
    }
    return sendError('Internal Server Error', 500);
  }
}
