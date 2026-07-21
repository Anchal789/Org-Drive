import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { requireApiSession } from '@/lib/require-auth';
import { uploadedFoldersRepository } from '@/repositories/uploaded-folders.repository';

export async function DELETE(request: NextRequest) {
  const session = await requireApiSession(request);
  if (session instanceof NextResponse) return session;

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const shareId = url.searchParams.get('shareId');
  const pathName = url.searchParams.get('pathName');

  if (!id) return sendError('File not found', 400);

  try {
    const deletedFolder = await uploadedFoldersRepository.deleteFolder(
      Number(id),
      Number(shareId),
      Number(session.userId),
    );

    if (!deletedFolder) return sendError('Folder not found', 400);

    if (pathName) {
      revalidatePath(pathName);
    }
    return sendSuccess(null, 'Folder moved to trash.', 200);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return sendError(errMsg, 500);
  }
}
