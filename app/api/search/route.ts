import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { requireApiSession } from '@/lib/require-auth';
import { searchRepository } from '@/repositories/search.repository';

export async function GET(request: NextRequest) {
  const session = await requireApiSession(request);
  if (session instanceof NextResponse) return session;

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
