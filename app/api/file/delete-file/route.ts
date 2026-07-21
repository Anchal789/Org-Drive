import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { requireApiSession } from '@/lib/require-auth';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.repository';

export async function DELETE(request: NextRequest) {
  const session = await requireApiSession(request);
  if (session instanceof NextResponse) return session;

  const url = new URL(request.url);
  const fileId = url.searchParams.get('fileId');
  const sharedId = url.searchParams.get('shareId');
  const pathName = url.searchParams.get('pathName');

  if (!fileId) return sendError('File not found', 400);

  try {
    const deletedFile = await uploadedFilesRepository.deleteFile(
      Number(fileId),
      Number(sharedId),
      Number(session.userId),
    );

    if (!deletedFile) return sendError('File not found', 400);

    if (pathName) {
      revalidatePath(pathName);
    }
    return sendSuccess(null, 'File moved to trash.', 200);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return sendError(errMsg, 500);
  }
}
