import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { generateAccessToken } from '@/lib/jwt';
import { createSession } from '@/lib/session';
import { userRepository } from '@/repositories/user.repository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user } = body;

    if (!user?.telegramId) {
      return sendError('Missing user data', 400);
    }

    const dbUser = await userRepository.upsert({
      telegramId: user.telegramId,
      telegramSessionString: user.telegramSessionString,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl,
      phone: user.phone ?? null,
    });

    await createSession({
      ...dbUser,
      userId: String(dbUser.id),
    });

    const accessToken = await generateAccessToken(
      String(dbUser.id),
      String(dbUser.telegramId),
      String(dbUser.firstName),
      String(dbUser.lastName),
      String(dbUser.username),
      String(dbUser.photoUrl),
    );

    return sendSuccess(
      { step: 'success', user: dbUser, accessToken },
      'Login finalized and saved to database successfully',
    );
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return sendError(errMsg, 500);
  }
}
