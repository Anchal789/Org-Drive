// app/api/auth/verify-otp/route.js
import { NextResponse } from 'next/server';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { getFromYourDatabase, saveUserFinalSession } from '@/lib/prisma';

export async function POST(request: Request) {
  const { phoneNumber, otpCode, phoneCodeHash } = await request.json();

  // 1. Retrieve the temporary session string from your database
  const savedData = await getFromYourDatabase(phoneNumber);
  if (!savedData) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 400 },
    );
  }

  // 2. Rehydrate the client using the exact same session state
  const stringSession = new StringSession(savedData.session);
  const client = new TelegramClient(
    stringSession,
    Number(process.env.TELEGRAM_APP_API_ID),
    String(process.env.TELEGRAM_APP_API_HASH),
    {
      connectionRetries: 5,
    },
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
    // 3. Complete Sign In
    const user = await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: phoneNumber,
        phoneCodeHash: phoneCodeHash,
        phoneCode: otpCode,
      }),
    );

    // 4. This is your final auth token! Save this permanently for this user
    const finalSessionString = client.session.save();
    await saveUserFinalSession(user.userId, finalSessionString);

    try {
      return NextResponse.json({
        success: true,
        message: 'Logged in!',
        userId: user.userId,
      });
    } catch (_error) {
      return NextResponse.json(
        { success: false, error: _error as string },
        { status: 400 },
      );
    }
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: _error as string },
      { status: 400 },
    );
  }
}
