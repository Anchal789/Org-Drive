import 'server-only';
import type { NextRequest } from 'next/server';
import { sendError } from './api-response';
import { getApiSession } from './session';

/**
 * Resolves the Bearer-token session for an API route, or returns the 401
 * response to short-circuit with. Replaces the `if (!session?.userId) return
 * sendError('Unauthorized', 401)` line duplicated across every route.
 *
 * Usage:
 *   const session = await requireApiSession(request);
 *   if (session instanceof NextResponse) return session;
 */
export async function requireApiSession(request: NextRequest) {
  const session = await getApiSession(request);
  if (!session?.userId) {
    return sendError('Unauthorized', 401);
  }
  return session;
}
