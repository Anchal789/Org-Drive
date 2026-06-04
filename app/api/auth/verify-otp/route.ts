import { NextResponse } from "next/server";
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { pendingLoginRepository } from "@/repositories/pending-login.repository";
import { userRepository } from "@/repositories/user.repository";
import { createSession } from "@/lib/session";

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);

async function fetchTelegramUser(client: TelegramClient) {
  const me: any = await client.getMe();
  const user: any = {
    telegramId: String(me.id),
    firstName: me.firstName ?? null,
    lastName: me.lastName ?? null,
    username: me.username ?? null,
    photoUrl: null,
    phone: me.phone ?? null,
  };

  try {
    const photoBuffer = await client.downloadProfilePhoto(me, { isBig: false });
    if (photoBuffer && photoBuffer.length > 0) {
      user.photoUrl = `data:image/jpeg;base64,${(
        photoBuffer as Buffer
      ).toString("base64")}`;
    }
  } catch (err) {
    console.error("Failed to fetch profile photo", err);
  }

  return user;
}

export async function POST(request: Request) {
  const { phoneNumber, otpCode } = await request.json();

  if (!phoneNumber || !otpCode) {
    return NextResponse.json(
      { success: false, error: "Missing phoneNumber or otpCode" },
      { status: 400 },
    );
  }

  const savedData = await pendingLoginRepository.findByPhone(phoneNumber);
  if (!savedData) {
    return NextResponse.json(
      { success: false, error: "No pending login for this number" },
      { status: 404 },
    );
  }

  const client = new TelegramClient(
    new StringSession(savedData.session),
    API_ID,
    API_HASH,
    { connectionRetries: 5 },
  );

  try {
    await client.connect();
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: "Failed to connect to Telegram" },
      { status: 500 },
    );
  }

  try {
    await client.invoke(
      new Api.auth.SignIn({
        phoneNumber,
        phoneCodeHash: savedData.phoneCodeHash,
        phoneCode: otpCode,
      }),
    );

    const user = await fetchTelegramUser(client);

    try {
      await client.invoke(new Api.auth.LogOut());
    } catch {}

    const dbUser = await userRepository.upsert({
      telegramId: user.telegramId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl,
      phone: phoneNumber,
    });

    await pendingLoginRepository.delete(savedData.id);

    await client.disconnect();

    await createSession(dbUser.id);

    return NextResponse.json({
      success: true,
      status: "success",
      user: dbUser,
    });
  } catch (error: any) {
    if (error?.errorMessage === "SESSION_PASSWORD_NEEDED") {
      const updatedSession = client.session.save() as unknown as string;
      await pendingLoginRepository.updateSession(savedData.id, updatedSession);

      let hint: string | null = null;
      try {
        const passwordInfo: any = await client.invoke(
          new Api.account.GetPassword(),
        );
        hint = passwordInfo.hint ?? null;
      } catch {}

      await client.disconnect();
      return NextResponse.json({
        success: true,
        status: "needs_password",
        passwordHint: hint,
      });
    }

    await client.disconnect();
    return NextResponse.json(
      { success: false, error: error?.message ?? "Invalid or expired code" },
      { status: 400 },
    );
  }
}
