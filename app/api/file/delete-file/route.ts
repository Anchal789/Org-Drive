import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { getApiSession } from '@/lib/session';
import { decrypt } from '@/lib/utils';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.respository';

export async function DELETE(request: NextRequest) {
  const session = await getApiSession(request);

  if (!session?.userId) return sendError('Unauthorized', 401);

  const url = new URL(request.url);
  const fileId = decrypt(url.searchParams.get('fileId') || '');
  const sharedId = decrypt(url.searchParams.get('shareId') || '');

  if (!fileId) return sendError('File not found', 400);

  try {
    const deletedFile = await uploadedFilesRepository.deleteFile(
      Number(fileId),
      Number(sharedId),
    );

    if (!deletedFile) return sendError('File not found', 400);
    return sendSuccess(null, 'File moved to trash.', 200);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return sendError(errMsg, 500);
  }
}
