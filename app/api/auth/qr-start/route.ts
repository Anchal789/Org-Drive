import QRCode from 'qrcode';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { sendError, sendSuccess } from '@/lib/api-response';
import {
  buildTelegramQRUrl,
  finalizeLogin,
  generateLoginId,
} from '@/lib/telegram-qr';
import { qrStore } from '@/lib/telegram-qr-store';

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);

export async function POST() {
  const client = new TelegramClient(new StringSession(''), API_ID, API_HASH, {
    connectionRetries: 5,
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
      return sendError(`Unexpected response: ${result.className}`, 500);
    }

    const token = result.token as Buffer;
    const expires = result.expires;
    const qrUrl = buildTelegramQRUrl(token);
    const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 280, margin: 2 });

    const loginId = generateLoginId();

    qrStore.set(loginId, client);

    client.addEventHandler(async (update) => {
      if (update.className !== 'UpdateLoginToken') return;

      try {
        let finalResult: Api.auth.TypeLoginToken;

        try {
          finalResult = await client.invoke(
            new Api.auth.ExportLoginToken({
              apiId: API_ID,
              apiHash: API_HASH,
              exceptIds: [],
            }),
          );
        } catch (err: unknown) {
          const errMsg =
            err instanceof Error
              ? ((err as { errorMessage?: string }).errorMessage ?? err.message)
              : String(err);
          if (errMsg === 'SESSION_PASSWORD_NEEDED') {
            const passwordInfo: Api.account.Password = await client.invoke(
              new Api.account.GetPassword(),
            );
            qrStore.markNeedsPassword(loginId, passwordInfo.hint ?? null);
            return;
          }
          throw err;
        }

        if (finalResult.className === 'auth.LoginTokenMigrateTo') {
          await client._switchDC(finalResult.dcId);
          try {
            finalResult = await client.invoke(
              new Api.auth.ImportLoginToken({ token: finalResult.token }),
            );
          } catch (err: unknown) {
            const errMsg =
              err instanceof Error
                ? ((err as { errorMessage?: string }).errorMessage ??
                  err.message)
                : String(err);
            if (errMsg === 'SESSION_PASSWORD_NEEDED') {
              const passwordInfo: Api.account.Password = await client.invoke(
                new Api.account.GetPassword(),
              );
              qrStore.markNeedsPassword(loginId, passwordInfo.hint ?? null);
              return;
            }
            throw err;
          }
        }

        if (finalResult.className === 'auth.LoginTokenSuccess') {
          await finalizeLogin(loginId, client);
        } else {
          qrStore.markError(loginId, `Unexpected: ${finalResult.className}`);
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        qrStore.markError(loginId, errMsg ?? 'Scan handler failed');
      }
    });

    return sendSuccess(
      {
        loginId,
        qrDataUrl,
        expiresAt: expires * 1000,
      },
      'QR login started successfully',
      200,
    );
  } catch {
    await client.disconnect().catch(() => {
      void 0;
    });
    return sendError('Failed to start QR login', 500);
  }
}
