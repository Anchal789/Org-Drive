import { randomBytes } from 'node:crypto';
import { Api, type TelegramClient } from 'telegram';
import { qrStore } from '@/lib/telegram-qr-store';
import type { TelegramUser } from '@/types/auth';

export function generateLoginId(): string {
  return randomBytes(16).toString('hex');
}

export function toBase64Url(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function buildTelegramQRUrl(token: Buffer): string {
  return `tg://login?token=${toBase64Url(token)}`;
}

export async function finalizeLogin(loginId: string, client: TelegramClient) {
  const me: Api.User = await client.getMe();
  const finalSessionString = client.session.save() as unknown as string;

  const user: TelegramUser = {
    telegramId: String(me.id),
    telegramSessionString: finalSessionString,
    firstName: me.firstName ?? null,
    lastName: me.lastName ?? null,
    username: me.username ?? null,
    photoUrl: null,
  };

  try {
    const photoBuffer = await client.downloadProfilePhoto(me, { isBig: false });
    if (photoBuffer && photoBuffer.length > 0) {
      user.photoUrl = `data:image/jpeg;base64,${(
        photoBuffer as Buffer
      ).toString('base64')}`;
    }
  } catch (err) {
    void err;
  }

  try {
    await client.invoke(new Api.auth.LogOut());
  } catch (err) {
    void err;
  }

  qrStore.markSuccess(loginId, user);
}
