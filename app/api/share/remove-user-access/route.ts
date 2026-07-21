import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { requireApiSession } from '@/lib/require-auth';
import { shareRepository } from '@/repositories/share.repository';

interface RemoveUserAccessBody {
  id: number;
}

export async function POST(request: NextRequest) {
  const [{ id }, session] = await Promise.all([
    request.json() as Promise<RemoveUserAccessBody>,
    requireApiSession(request),
  ]);

  if (session instanceof NextResponse) return session;

  if (!id) {
    return sendError('Missing id', 400);
  }

  try {
    const response = await shareRepository.revokeAccess(
      Number(id),
      Number(session.userId),
    );

    if (!response) {
      return sendError('Failed to remove access', 500);
    }
    return sendSuccess(null, 'Access removed successfully', 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(error.message, 500);
    }
    return sendError('Internal Server Error', 500);
  }
}
