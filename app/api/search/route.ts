import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { getApiSession } from '@/lib/session';
import { searchRepository } from '@/repositories/search.repository';

export async function GET(request: NextRequest) {
  const session = await getApiSession(request);

  if (!session?.userId) {
    return sendError('Access token missing or expired', 401);
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim() === '') {
    return sendSuccess({ files: [], folders: [] }, 'Empty search', 200);
  }

  try {
    const results = await searchRepository.searchFilesAndFolders(
      Number(session.userId),
      q,
    );

    return sendSuccess(results, 'Search completed', 200);
  } catch {
    return sendError('Failed to perform search', 500);
  }
}
