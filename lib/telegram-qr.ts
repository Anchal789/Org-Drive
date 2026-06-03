import { randomBytes } from 'crypto';

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
