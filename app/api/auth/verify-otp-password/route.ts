// app/api/auth/verify-otp-password/route.ts
import { NextResponse } from "next/server";
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { computeCheck } from "telegram/Password";
import { getFromYourDatabase, deletePendingSession } from "@/lib/auth";

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
    phoneNumber: me.phone ?? null,
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
  const { phoneNumber, password } = await request.json();

  if (!phoneNumber || !password) {
    return NextResponse.json(
      { success: false, error: "Missing phoneNumber or password" },
      { status: 400 },
    );
  }

  const rows = await getFromYourDatabase(phoneNumber);
  const savedData = rows[0];
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

    const passwordInfo: any = await client.invoke(
      new Api.account.GetPassword(),
    );
    const passwordCheck = await computeCheck(passwordInfo, password);

    try {
      await client.invoke(
        new Api.auth.CheckPassword({ password: passwordCheck }),
      );
    } catch (err: any) {
      await client.disconnect();
      if (err?.errorMessage === "PASSWORD_HASH_INVALID") {
        return NextResponse.json(
          { success: false, error: "Incorrect password" },
          { status: 401 },
        );
      }
      throw err;
    }

    // Password accepted — fetch user, log out, clean up
    const user = await fetchTelegramUser(client);

    try {
      await client.invoke(new Api.auth.LogOut());
    } catch {}

    await deletePendingSession(String(savedData.id));
    await client.disconnect();

    // TODO: create/update user in DB, set session cookie
    // const dbUser = await prisma.user.upsert({ ... });
    // (await cookies()).set("session", await createSession(dbUser.id), { ... });

    return NextResponse.json({
      success: true,
      status: "success",
      user,
    });
  } catch (error: any) {
    await client.disconnect().catch(() => {});
    console.error("Password verify failed:", error?.message ?? error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message ?? "Password verification failed",
      },
      { status: 500 },
    );
  }
}
