import { NextResponse } from 'next/server';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { saveToYourDatabase } from '@/lib/prisma';

export async function POST(request: Request) {
  const { phoneNumber } = await request.json();

  const stringSession = new StringSession('');
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

  // 2. Request OTP from Telegram
  const result = await client.sendCode(
    {
      apiId: Number(process.env.TELEGRAM_APP_API_ID),
      apiHash: String(process.env.TELEGRAM_APP_API_HASH),
    },
    phoneNumber,
  );

  // 3. Save the partial session string and the hash to your database
  const partialSession = client.session.save();

  await saveToYourDatabase({
    phone: phoneNumber,
    phoneCodeHash: result.phoneCodeHash,
    session: partialSession,
  });

  return NextResponse.json({
    success: true,
    phoneCodeHash: result.phoneCodeHash,
  });
}
