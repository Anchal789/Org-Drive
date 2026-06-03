// app/api/auth/verify-otp/route.ts
import { NextResponse } from 'next/server';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { getFromYourDatabase, saveUserFinalSession } from '@/lib/auth';

export async function POST(request: Request) {
  const { phoneNumber, otpCode } = await request.json();

  const rows = await getFromYourDatabase(phoneNumber);
  const savedData = rows[0];
  if (!savedData) {
    return NextResponse.json(
      { success: false, error: 'No pending login for this number' },
      { status: 404 },
    );
  }

  const stringSession = new StringSession(savedData.session);
  const client = new TelegramClient(
    stringSession,
    Number(process.env.TELEGRAM_APP_API_ID),
    String(process.env.TELEGRAM_APP_API_HASH),
    { connectionRetries: 5 },
  );

  try {
    await client.connect();
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Failed to connect to Telegram' },
      { status: 500 },
    );
  }

  try {
    await client.invoke(
      new Api.auth.SignIn({
        phoneNumber,
        phoneCodeHash: savedData.phoneCodeHash,
        phoneCode: otpCode,
      }),
    );

    const finalSessionString = client.session.save() as unknown as string;
    await saveUserFinalSession(savedData.id, finalSessionString);

    await client.disconnect();
    return NextResponse.json({ success: true, message: 'Logged in!' });
  } catch (error: any) {
    await client.disconnect();
    if (error?.errorMessage === 'SESSION_PASSWORD_NEEDED') {
      return NextResponse.json(
        { success: false, error: '2FA password required' },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Invalid or expired code' },
      { status: 400 },
    );
  }
}
