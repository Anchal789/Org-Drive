import type { NextRequest } from 'next/server';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { sendError, sendSuccess } from '@/lib/api-response';
import { createSession } from '@/lib/session';
import { pendingLoginRepository } from '@/repositories/pending-login.repository';
import { userRepository } from '@/repositories/user.repository';
import type { UpsertUserInput } from '@/types/auth';

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);

async function fetchTelegramUser(client: TelegramClient) {
  const me: Api.User = await client.getMe();
  const user: UpsertUserInput = {
    telegramId: String(me.id),
    telegramSessionString: client.session.save() as unknown as string,
    firstName: me.firstName ?? null,
    lastName: me.lastName ?? null,
    username: me.username ?? null,
    photoUrl: null,
    phone: me.phone ?? null,
  };

  try {
    const photoBuffer = await client.downloadProfilePhoto(me, { isBig: false });
    if (photoBuffer && photoBuffer.length > 0) {
      user.photoUrl = `data:image/jpeg;base64,${(photoBuffer as Buffer).toString('base64')}`;
    }
  } catch (err) {
    console.error('Failed to fetch profile photo', err);
  }

  return user;
}

export async function POST(request: NextRequest) {
  const { phoneNumber, otpCode } = await request.json();

  if (!phoneNumber || !otpCode) {
    return sendError('Missing phoneNumber or otpCode', 400);
  }

  const savedData = await pendingLoginRepository.findByPhone(phoneNumber);
  if (!savedData) {
    return sendError('No pending login for this number', 404);
  }

  const client = new TelegramClient(
    new StringSession(savedData.session),
    API_ID,
    API_HASH,
    { connectionRetries: 1 },
  );

  try {
    await client.connect();
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (client) await client.disconnect().catch(() => {});
    if (errMsg?.includes('AUTH_KEY_UNREGISTERED')) {
      return sendError('Telegram session expired. Please log in again.', 401);
    }
    return sendError('Failed to connect to Telegram infrastructure', 500);
  }

  try {
    await client.invoke(
      new Api.auth.SignIn({
        phoneNumber,
        phoneCodeHash: savedData.phoneCodeHash,
        phoneCode: otpCode,
      }),
    );

    const user = await fetchTelegramUser(client);
    const finalSessionString = client.session.save() as unknown as string;

    const dbUser = await userRepository.upsert({
      telegramId: user.telegramId,
      telegramSessionString: finalSessionString,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl,
      phone: phoneNumber,
    });

    await pendingLoginRepository.delete(savedData.id);

    await client.disconnect();

    await createSession({
      ...dbUser,
      userId: String(dbUser.id),
    });

    return sendSuccess(
      {
        step: 'success',
        user: dbUser,
      },
      'Login completed successfully',
    );
  } catch (err: unknown) {
    const errMsg =
      err instanceof Error
        ? ((err as { errorMessage?: string }).errorMessage ?? err.message)
        : String(err);
    if (errMsg === 'SESSION_PASSWORD_NEEDED') {
      const updatedSession = client.session.save() as unknown as string;
      await pendingLoginRepository.updateSession(savedData.id, updatedSession);

      let hint: string | null = null;
      try {
        const passwordInfo: Api.account.Password = await client.invoke(
          new Api.account.GetPassword(),
        );
        hint = passwordInfo.hint ?? null;
      } catch {}

      await client.disconnect();

      return sendSuccess(
        {
          step: 'needs_password',
          passwordHint: hint,
        },
        '2FA password is required to continue',
      );
    }

    await client.disconnect();
    return sendError(
      errMsg.includes('PHONE_CODE_INVALID')
        ? 'Invalid or expired OTP code'
        : errMsg,
      400,
    );
  } finally {
    await client.disconnect().catch(() => {});
  }
}
