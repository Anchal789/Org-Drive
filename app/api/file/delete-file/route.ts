import { sendError, sendSuccess } from '@/lib/api-response';
import { decrypt } from '@/lib/utils';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.respository';

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const fileId = decrypt(url.searchParams.get('fileId') || '');

  if (!fileId) return sendError('File not found', 400);

  try {
    const deletedFile = await uploadedFilesRepository.deleteFile(
      Number(fileId),
    );

    if (!deletedFile) return sendError('File not found', 400);
    return sendSuccess(null, 'File moved to trash.', 200);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return sendError(errMsg, 500);
  }
}
