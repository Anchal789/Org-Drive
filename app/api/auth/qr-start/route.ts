// app/api/auth/qr-start/route.ts
import { NextResponse } from "next/server";
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import QRCode from "qrcode";
import { qrStore } from "@/lib/telegram-qr-store";
import {
  generateLoginId,
  buildTelegramQRUrl,
  finalizeLogin,
} from "@/lib/telegram-qr";

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);

export async function POST() {
  const client = new TelegramClient(new StringSession(""), API_ID, API_HASH, {
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

    if (result.className !== "auth.LoginToken") {
      await client.disconnect();
      return NextResponse.json(
        { success: false, error: `Unexpected response: ${result.className}` },
        { status: 500 },
      );
    }

    const token = result.token as Buffer;
    const expires = result.expires;
    const qrUrl = buildTelegramQRUrl(token);
    const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 280, margin: 2 });

    const loginId = generateLoginId();

    qrStore.set(loginId, client);

    client.addEventHandler(async (update: any) => {
      if (update.className !== "UpdateLoginToken") return;

      try {
        let finalResult: any;

        try {
          finalResult = await client.invoke(
            new Api.auth.ExportLoginToken({
              apiId: API_ID,
              apiHash: API_HASH,
              exceptIds: [],
            }),
          );
        } catch (err: any) {
          // 2FA is enabled — Telegram demands the password before completing login
          if (err?.errorMessage === "SESSION_PASSWORD_NEEDED") {
            const passwordInfo: any = await client.invoke(
              new Api.account.GetPassword(),
            );
            qrStore.markNeedsPassword(loginId, passwordInfo.hint ?? null);
            return;
          }
          throw err;
        }

        // DC migration
        if (finalResult.className === "auth.LoginTokenMigrateTo") {
          await (client as any)._switchDC(finalResult.dcId);
          try {
            finalResult = await client.invoke(
              new Api.auth.ImportLoginToken({ token: finalResult.token }),
            );
          } catch (err: any) {
            if (err?.errorMessage === "SESSION_PASSWORD_NEEDED") {
              const passwordInfo: any = await client.invoke(
                new Api.account.GetPassword(),
              );
              qrStore.markNeedsPassword(loginId, passwordInfo.hint ?? null);
              return;
            }
            throw err;
          }
        }

        if (finalResult.className === "auth.LoginTokenSuccess") {
          await finalizeLogin(loginId, client);
        } else {
          qrStore.markError(loginId, `Unexpected: ${finalResult.className}`);
        }
      } catch (err: any) {
        console.error("Scan handler failed:", err?.message ?? err);
        qrStore.markError(loginId, err?.message ?? "Scan handler failed");
      }
    });

    return NextResponse.json({
      success: true,
      loginId,
      qrDataUrl,
      expiresAt: expires * 1000,
    });
  } catch (error: any) {
    await client.disconnect().catch(() => {});
    console.error("QR start failed:", error?.message ?? error);
    return NextResponse.json(
      { success: false, error: "Failed to start QR login" },
      { status: 500 },
    );
  }
}
