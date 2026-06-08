// app/api/auth/qr-login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Api } from "telegram";
import QRCode from "qrcode";
import { qrStore } from "@/lib/telegram-qr-store";
import { buildTelegramQRUrl } from "@/lib/telegram-qr";
import { createSession } from "@/lib/session";
import { userRepository } from "@/repositories/user.repository";

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);

export async function GET(request: NextRequest) {
  const loginId = request.nextUrl.searchParams.get("loginId");
  if (!loginId) {
    return NextResponse.json(
      { success: false, error: "Missing loginId" },
      { status: 400 },
    );
  }

  const entry = qrStore.get(loginId);
  if (!entry) {
    return NextResponse.json(
      { status: "expired", error: "Login session not found or expired" },
      { status: 410 },
    );
  }

  if (entry.status === "needs_password") {
    return NextResponse.json({
      status: "needs_password",
      passwordHint: entry.passwordHint,
    });
  }

  if (entry.status === "success" && entry.user) {
    const user = entry.user;
    await qrStore.delete(loginId);

    const dbUser = await userRepository.upsert({
      telegramId: user.telegramId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl,
      phone: user.phone ?? null,
    });

    await createSession(dbUser.id);

    return NextResponse.json({ status: "success", user });
  }

  if (entry.status === "error") {
    const error = entry.error;
    await qrStore.delete(loginId);
    return NextResponse.json({ status: "error", error });
  }

  try {
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
      return NextResponse.json({
        status: "waiting",
        qrDataUrl,
        expiresAt: result.expires * 1000,
      });
    }

    return NextResponse.json({ status: "waiting" });
  } catch (error: any) {
    console.error("Poll error:", error?.message ?? error);
    return NextResponse.json({ status: "waiting" });
  }
}
