import type { NextRequest } from 'next/server';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { sendError, sendSuccess } from '@/lib/api-response';
import { pendingLoginRepository } from '@/repositories/pending-login.repository';

export async function POST(request: NextRequest) {
  const { phoneNumber } = await request.json();

  if (!phoneNumber) {
    return sendError('Phone number is required', 400);
  }

  const stringSession = new StringSession('');
  const client = new TelegramClient(
    stringSession,
    Number(process.env.TELEGRAM_APP_API_ID),
    String(process.env.TELEGRAM_APP_API_HASH),
    {
      connectionRetries: 1,
    },
  );

  try {
    await client.connect();
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);

    console.error('Telegram connect error:', errMsg);

    if (client) await client.disconnect().catch(() => {});
    if (errMsg?.includes('AUTH_KEY_UNREGISTERED')) {
      return sendError('Telegram session expired. Please log in again.', 401);
    }
    return sendError(errMsg, 500);
  }

  let result: { phoneCodeHash: string; isCodeViaApp: boolean } | null = null;
  try {
    result = await client.sendCode(
      {
        apiId: Number(process.env.TELEGRAM_APP_API_ID),
        apiHash: String(process.env.TELEGRAM_APP_API_HASH),
      },
      phoneNumber,
    );
  } catch (err: unknown) {
    await client.disconnect();
    const errMsg =
      err instanceof Error
        ? ((err as { errorMessage?: string }).errorMessage ?? err.message)
        : String(err);
    console.error('sendCode failed:', errMsg ?? errMsg ?? err);

    const errorMessage =
      errMsg === 'PHONE_NUMBER_INVALID'
        ? 'Invalid phone number'
        : 'Failed to send code';

    return sendError(errorMessage, 400);
  }

  const partialSession = client.session.save() as unknown as string;

  if (!result?.phoneCodeHash) {
    await client.disconnect();
    return sendError('Failed to generate phone code hash', 500);
  }

  await pendingLoginRepository.create({
    phone: phoneNumber,
    phoneCodeHash: result.phoneCodeHash,
    session: partialSession,
  });

  await client.disconnect();

  return sendSuccess(
    {
      phoneCodeHash: result.phoneCodeHash,
      isCodeViaApp: result.isCodeViaApp,
    },
    'OTP sent successfully',
  );
}
