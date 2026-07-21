import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { requireApiSession } from '@/lib/require-auth';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.repository';

export async function POST(request: NextRequest) {
  const session = await requireApiSession(request);
  if (session instanceof NextResponse) return session;

  try {
    const { items, pathName } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError('No items provided for deletion', 400);
    }

    await uploadedFilesRepository.deleteMultipleItems(
      items,
      Number(session.userId),
    );

    if (pathName) {
      revalidatePath(pathName);
    }
    return sendSuccess(null, 'Items deleted successfully', 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(error.message, 500);
    }
    return sendError('An unknown error occurred during deletion', 500);
  }
}
