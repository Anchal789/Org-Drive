import { type NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { buildTelegramQRUrl } from '@/lib/telegram-qr';
import { qrStore } from '@/lib/telegram-qr-store';

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);

export async function GET(request: NextRequest) {
  const loginId = request.nextUrl.searchParams.get('loginId');
  if (!loginId) {
    return NextResponse.json(
      { success: false, error: 'Missing loginId' },
      { status: 400 },
    );
  }

  const sessionString = qrStore.get(loginId);
  if (!sessionString) {
    return NextResponse.json(
      { status: 'expired', error: 'Login session not found or expired' },
      { status: 410 },
    );
  }

  const client = new TelegramClient(
    new StringSession(sessionString),
    API_ID,
    API_HASH,
    { connectionRetries: 3 },
  );

  try {
    await client.connect();

    const result = await client.invoke(
      new Api.auth.ExportLoginToken({
        apiId: API_ID,
        apiHash: API_HASH,
        exceptIds: [],
      }),
    );

    qrStore.update(loginId, client.session.save() as unknown as string);

    if (result.className === 'auth.LoginToken') {
      const token = result.token as Buffer;
      const qrUrl = buildTelegramQRUrl(token);
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 280,
        margin: 2,
      });
      await client.disconnect();
      return NextResponse.json({
        status: 'waiting',
        qrDataUrl,
        expiresAt: result.expires * 1000,
      });
    }

    if (result.className === 'auth.LoginTokenSuccess') {
      const me = await client.getMe();

      const user = {
        telegramId: String((me as any).id),
        firstName: (me as any).firstName ?? null,
        lastName: (me as any).lastName ?? null,
        username: (me as any).username ?? null,
        photoUrl: null as string | null,
      };

      try {
        const photoBuffer = await client.downloadProfilePhoto(me, {
          isBig: false,
        });
        if (photoBuffer && photoBuffer.length > 0) {
          user.photoUrl = `data:image/jpeg;base64,${(
            photoBuffer as Buffer
          ).toString('base64')}`;
        }
      } catch (err) {
        console.error('Failed to fetch profile photo', err);
      }
      try {
        await client.invoke(new Api.auth.LogOut());
      } catch (err) {
        console.error('Failed to log out', err);
      }
      await client.disconnect();
      qrStore.delete(loginId);

      // TODO: here you would create/update the user in your DB
      // and set a session cookie for YOUR app's auth.
      // Example sketch:
      //
      // const dbUser = await prisma.user.upsert({
      //   where: { telegramId: BigInt(user.telegramId) },
      //   update: { firstName: user.firstName, ... },
      //   create: { telegramId: BigInt(user.telegramId), firstName: ..., ... },
      // });
      // (await cookies()).set("session", await createSession(dbUser.id), {
      //   httpOnly: true, secure: true, sameSite: "lax",
      // });

      return NextResponse.json({ status: 'success', user });
    }

    // DC migration — rare, but possible
    if (result.className === 'auth.LoginTokenMigrateTo') {
      await (client as any)._switchDC(result.dcId);
      const migrated = await client.invoke(
        new Api.auth.ImportLoginToken({ token: result.token }),
      );
      qrStore.update(loginId, client.session.save() as unknown as string);
      await client.disconnect();

      // Recurse logically — tell the browser to poll again
      return NextResponse.json({
        status: 'waiting',
        message: 'DC migrated, please continue polling',
      });
    }

    await client.disconnect();
    return NextResponse.json(
      { status: 'error', error: `Unexpected: ${result}` },
      { status: 500 },
    );
  } catch (error: any) {
    await client.disconnect().catch(() => {});
    console.error('QR poll failed:', error?.message ?? error);
    return NextResponse.json(
      { status: 'error', error: 'Poll failed' },
      { status: 500 },
    );
  }
}
