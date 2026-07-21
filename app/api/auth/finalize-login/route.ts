import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { generateAccessToken } from '@/lib/jwt';
import { createSession } from '@/lib/session';
import { toPublicUser, userRepository } from '@/repositories/user.repository';
import type { TelegramUser } from '@/types/auth';

if (!process.env.AUTH_SERVER_INTERNAL_SECRET) {
  throw new Error('Missing required env var: AUTH_SERVER_INTERNAL_SECRET');
}

export async function POST(request: NextRequest) {
  try {
    const { loginId } = await request.json();

    if (!loginId || typeof loginId !== 'string') {
      return sendError('Missing loginId', 400);
    }

    // Fetch the completed Telegram session server-to-server — it never
    // transits the browser, unlike the old flow this replaces.
    const authServerUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;
    if (!authServerUrl) {
      return sendError('Auth server is not configured', 500);
    }

    const internalResponse = await fetch(
      `${authServerUrl.replace(/\/$/, '')}/internal/qr-result?loginId=${encodeURIComponent(loginId)}`,
      {
        headers: {
          'x-internal-secret': process.env.AUTH_SERVER_INTERNAL_SECRET as string,
        },
      },
    );

    if (!internalResponse.ok) {
      return sendError('No completed login for this id', 404);
    }

    const internalResult = (await internalResponse.json()) as {
      success: boolean;
      data?: { user: TelegramUser };
    };

    const user = internalResult.data?.user;
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
      phone: null,
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
      { step: 'success', user: toPublicUser(dbUser), accessToken },
      'Login finalized and saved to database successfully',
    );
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return sendError(errMsg, 500);
  }
}
