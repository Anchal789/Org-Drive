// app/api/auth/finalize-login/route.ts

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

    // 1. Save or update the user in your PostgreSQL database via Prisma
    const dbUser = await userRepository.upsert({
      telegramId: user.telegramId,
      telegramSessionString: user.telegramSessionString,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl,
      phone: user.phone ?? null,
    });

    // 2. Create the secure browser session (cookies)
    await createSession({
      ...dbUser,
      userId: String(dbUser.id),
    });

    // 3. Generate the JWT for your frontend state
    const accessToken = await generateAccessToken(
      String(dbUser.id),
      String(dbUser.telegramId),
      String(dbUser.firstName),
      String(dbUser.lastName),
      String(dbUser.username),
      String(dbUser.photoUrl),
    );

    // 4. Send success back to QrCode.tsx so it can redirect the user
    return sendSuccess(
      { step: 'success', user: dbUser, accessToken },
      'Login finalized and saved to database successfully',
    );
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return sendError(errMsg, 500);
  }
}
