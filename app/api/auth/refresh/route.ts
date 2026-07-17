import { cookies } from 'next/headers';
import { sendError, sendSuccess } from '@/lib/api-response';
import { generateAccessToken, verifyToken } from '@/lib/jwt';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return sendError('No refresh token found', 401);
  }

  const payload = await verifyToken(refreshToken);

  if (!payload?.userId) {
    return sendError('Invalid or expired refresh token', 403);
  }

  const newAccessToken = await generateAccessToken(
    payload.userId as string,
    payload.telegramId as string,
    payload.firstName as string,
    payload.lastName as string,
    payload.username as string,
    payload.photoUrl as string,
  );

  return sendSuccess({ accessToken: newAccessToken });
}
