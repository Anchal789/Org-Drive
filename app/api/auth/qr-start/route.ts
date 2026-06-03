import { NextResponse } from 'next/server';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import QRCode from 'qrcode';
import { qrStore } from '@/lib/telegram-qr-store';
import { generateLoginId, buildTelegramQRUrl } from '@/lib/telegram-qr';

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);

export async function POST() {
  const client = new TelegramClient(new StringSession(''), API_ID, API_HASH, {
    connectionRetries: 3,
  });

  try {
    await client.connect();

    const result = await client.invoke(
      new Api.auth.ExportLoginToken({
        apiId: API_ID,
        apiHash: API_HASH,
        exceptIds: [],
      }),
    );

    if (result.className !== 'auth.LoginToken') {
      await client.disconnect();
      return NextResponse.json(
        { success: false, error: `Unexpected response: ${result.className}` },
        { status: 500 },
      );
    }

    const token = result.token as Buffer;
    const expires = result.expires;

    const qrUrl = buildTelegramQRUrl(token);
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 280,
      margin: 2,
    });

    const sessionString = client.session.save() as unknown as string;
    const loginId = generateLoginId();
    qrStore.set(loginId, sessionString);

    // await client.disconnect();

    return NextResponse.json({
      success: true,
      loginId,
      qrDataUrl,
      expiresAt: expires * 1000,
    });
  } catch (error: any) {
    await client.disconnect().catch(() => {});
    console.error('QR start failed:', error?.message ?? error);
    return NextResponse.json(
      { success: false, error: 'Failed to start QR login' },
      { status: 500 },
    );
  }
}
