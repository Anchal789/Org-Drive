import { NextRequest, NextResponse } from "next/server";
import { computeCheck } from "telegram/Password";
import { Api } from "telegram";
import { qrStore } from "@/lib/telegram-qr-store";
import { finalizeLogin } from "@/lib/telegram-qr";
import { userRepository } from "@/repositories/user.repository";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const { loginId, password } = await request.json();

  if (!loginId || !password) {
    return NextResponse.json(
      { success: false, error: "Missing loginId or password" },
      { status: 400 },
    );
  }

  const entry = qrStore.get(loginId);
  if (!entry) {
    return NextResponse.json(
      { success: false, error: "Login session not found or expired" },
      { status: 410 },
    );
  }

  if (entry.status !== "needs_password") {
    return NextResponse.json(
      {
        success: false,
        error: `Cannot submit password in state: ${entry.status}`,
      },
      { status: 400 },
    );
  }

  try {
    const passwordInfo: any = await entry.client.invoke(
      new Api.account.GetPassword(),
    );

    const passwordCheck = await computeCheck(passwordInfo, password);

    try {
      await entry.client.invoke(
        new Api.auth.CheckPassword({ password: passwordCheck }),
      );
    } catch (err: any) {
      if (err?.errorMessage === "PASSWORD_HASH_INVALID") {
        return NextResponse.json(
          { success: false, error: "Incorrect password" },
          { status: 401 },
        );
      }
      throw err;
    }

    await finalizeLogin(loginId, entry.client);

    const updated = qrStore.get(loginId);
    if (updated?.status === "success" && updated.user) {
      const tgUser = updated.user;
      await qrStore.delete(loginId);

      const dbUser = await userRepository.upsert({
        telegramId: tgUser.telegramId,
        firstName: tgUser.firstName,
        lastName: tgUser.lastName,
        username: tgUser.username,
        photoUrl: tgUser.photoUrl,
        phone: tgUser.phone ?? null,
      });

      await createSession(dbUser.id);

      return NextResponse.json({
        success: true,
        status: "success",
        user: dbUser,
      });
    }

    return NextResponse.json(
      { success: false, error: "Login finalized in unexpected state" },
      { status: 500 },
    );
  } catch (err: any) {
    console.error("Password submit failed:", err?.message ?? err);
    return NextResponse.json(
      { success: false, error: err?.message ?? "Password submit failed" },
      { status: 500 },
    );
  }
}
