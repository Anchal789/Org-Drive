// app/api/auth/qr-password/route.ts

import type { NextRequest } from 'next/server';
import { Api } from 'telegram';
import { computeCheck } from 'telegram/Password';
import { sendError, sendSuccess } from '@/lib/api-response';
import { generateAccessToken } from '@/lib/jwt';
import { createSession } from '@/lib/session';
import { finalizeLogin } from '@/lib/telegram-qr';
import { qrStore } from '@/lib/telegram-qr-store';
import { userRepository } from '@/repositories/user.repository';

export async function POST(request: NextRequest) {
  const { loginId, password } = await request.json();

  if (!loginId || !password) {
    return sendError('Missing loginId or password', 400);
  }

  const entry = qrStore.get(loginId);
  if (!entry) {
    return sendError('Login session not found or expired', 410);
  }

  if (entry.status !== 'needs_password') {
    return sendError(`Cannot submit password in state: ${entry.status}`, 400);
  }

  try {
    const passwordInfo: Api.account.Password = await entry.client.invoke(
      new Api.account.GetPassword(),
    );

    const passwordCheck = await computeCheck(passwordInfo, password);

    try {
      await entry.client.invoke(
        new Api.auth.CheckPassword({ password: passwordCheck }),
      );
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? ((err as { errorMessage?: string }).errorMessage ?? err.message)
          : String(err);
      if (errMsg === 'PASSWORD_HASH_INVALID') {
        return sendError('Incorrect password', 401);
      }
      throw err;
    }

    await finalizeLogin(loginId, entry.client);

    const updated = qrStore.get(loginId);
    if (updated?.status === 'success' && updated.user) {
      const tgUser = updated.user;
      await qrStore.delete(loginId);

      const dbUser = await userRepository.upsert({
        telegramId: tgUser.telegramId,
        telegramSessionString: tgUser.telegramSessionString,
        firstName: tgUser.firstName,
        lastName: tgUser.lastName,
        username: tgUser.username,
        photoUrl: tgUser.photoUrl,
        phone: tgUser.phone ?? null,
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
        {
          step: 'success',
          user: dbUser,
          accessToken,
        },
        'Login successful',
      );
    }

    return sendError('Login finalized in unexpected state', 500);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return sendError(errMsg ?? 'Password submit failed', 500);
  }
}
