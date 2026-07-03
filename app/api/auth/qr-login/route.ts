// app/api/auth/qr-login/route.ts

import type { NextRequest } from "next/server";
import QRCode from "qrcode";
import { Api } from "telegram";
import { sendError, sendSuccess } from "@/lib/api-response";
import { createSession } from "@/lib/session";
import { buildTelegramQRUrl } from "@/lib/telegram-qr";
import { qrStore } from "@/lib/telegram-qr-store";
import { userRepository } from "@/repositories/user.repository";
import { generateAccessToken } from "@/lib/jwt";

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);

export async function GET(request: NextRequest) {
  const loginId = request.nextUrl.searchParams.get("loginId");
  if (!loginId) {
    return sendError("Missing loginId parameter", 400);
  }

  const entry = qrStore.get(loginId);
  if (!entry) {
    return sendError("Login session not found or expired", 410, {
      status: "expired",
    });
  }

  if (entry.status === "needs_password") {
    return sendSuccess(
      {
        step: "needs_password",
        passwordHint: entry.passwordHint,
      },
      "2FA password is required to continue",
    );
  }

  if (entry.status === "success" && entry.user) {
    const user = entry.user;
    await qrStore.delete(loginId);

    const dbUser = await userRepository.upsert({
      telegramId: user.telegramId,
      telegramSessionString: user.telegramSessionString,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl,
      phone: user.phone ?? null,
    });

    await createSession({
      ...dbUser,
      userId: String(dbUser.id),
    });

    const accessToken = await generateAccessToken(
      String(dbUser.id),
      String(dbUser.telegramId),
      String(dbUser.firstName),
      String(dbUser.lastName),
      String(dbUser.username),
      String(dbUser.photoUrl),
    );

    return sendSuccess(
      { step: "success", user: dbUser, accessToken },
      "Login completed successfully",
    );
  }

  if (entry.status === "error") {
    const error = entry.error;
    await qrStore.delete(loginId);
    return sendError(error || "QR Login failed", 400, { status: "error" });
  }

  try {
    if (!entry.client.connected) {
      await entry.client.connect();
    }
    const result = await entry.client.invoke(
      new Api.auth.ExportLoginToken({
        apiId: API_ID,
        apiHash: API_HASH,
        exceptIds: [],
      }),
    );

    if (result.className === "auth.LoginToken") {
      const token = result.token as Buffer;
      const qrUrl = buildTelegramQRUrl(token);
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 280,
        margin: 2,
      });

      return sendSuccess(
        {
          step: "waiting",
          qrDataUrl,
          expiresAt: result.expires * 1000,
        },
        "Waiting for QR scan",
      );
    }

    return sendSuccess({ step: "waiting" }, "Waiting for QR scan");
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error?.message : String(error);
    console.error("Poll error:", errMsg ?? error);
    try {
      await entry.client.disconnect();
    } catch (disconnectError) {
      console.error("Disconnect error:", disconnectError);
    }

    return sendSuccess(
      { step: "waiting" },
      "Waiting for QR scan (retrying connection)",
    );
  }
}
