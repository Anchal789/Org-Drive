import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

/**
 * Perimeter safety net for API routes: every route below already does its
 * own `requireApiSession` check, but a single forgotten check on a new route
 * would otherwise be a full auth bypass with nothing to catch it. This
 * mirrors the exact same Bearer-token check as `requireApiSession` so
 * behavior never diverges from what the route itself would have done.
 *
 * Routes that authenticate differently (public auth flows, the cron secret,
 * anonymous/token-based downloads, cookie-based upload) are intentionally
 * excluded — they enforce their own, different rules.
 */
const PUBLIC_API_PREFIXES = [
  '/api/auth/',
  '/api/cron/',
  '/api/file/download/',
  '/api/file/upload-files',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;

  const payload = token ? await verifyToken(token) : null;

  if (!payload || typeof payload !== 'object' || !('userId' in payload)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized', data: undefined },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
