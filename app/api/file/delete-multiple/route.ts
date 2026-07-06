import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { getApiSession } from '@/lib/session';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.respository';

export async function POST(request: NextRequest) {
  const session = await getApiSession(request);

  if (!session?.userId) return sendError('Unauthorized', 401);

  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError('No items provided for deletion', 400);
    }

    await uploadedFilesRepository.deleteMultipleItems(items);

    return sendSuccess(null, 'Items deleted successfully', 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(error.message, 500);
    }
    return sendError('An unknown error occurred during deletion', 500);
  }
}
