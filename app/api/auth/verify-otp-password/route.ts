import { Api, TelegramClient } from "telegram";
import { computeCheck } from "telegram/Password";
import { StringSession } from "telegram/sessions";
import { sendError, sendSuccess } from "@/lib/api-response";
import { createSession } from "@/lib/session";
import { pendingLoginRepository } from "@/repositories/pending-login.repository";
import { userRepository } from "@/repositories/user.repository";
import type { UpsertUserInput } from "@/types/auth";

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);

async function fetchTelegramUser(client: TelegramClient) {
  const me: Api.User = await client.getMe();
  const user: UpsertUserInput = {
    telegramId: String(me.id),
    telegramSessionString: client.session.save() as unknown as string,
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
  const { phoneNumber, password } = await request.json();

  if (!phoneNumber || !password) {
    return sendError("Missing phoneNumber or password", 400);
  }

  const savedData = await pendingLoginRepository.findByPhone(phoneNumber);
  if (!savedData) {
    return sendError("No pending login for this number", 404);
  }

  const client = new TelegramClient(
    new StringSession(savedData.session),
    API_ID,
    API_HASH,
    {
      connectionRetries: 1,
      useWSS: false,
      proxy: {
        ip: "123.45.67.89", // Proxy IP
        port: 1080, // Proxy Port
        MTProxy: true, // Set to true if using an MTProto proxy
        secret: "ee123456789...", // Secret (if required by the proxy)
        socksType: 5, // Or SOCKS5 configuration
      },
    },
  );

  try {
    await client.connect();

    const passwordInfo: Api.account.Password = await client.invoke(
      new Api.account.GetPassword(),
    );
    const passwordCheck = await computeCheck(passwordInfo, password);

    try {
      await client.invoke(
        new Api.auth.CheckPassword({ password: passwordCheck }),
      );
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? ((err as { errorMessage?: string }).errorMessage ?? err.message)
          : String(err);
      await client.disconnect();
      if (errMsg === "PASSWORD_HASH_INVALID") {
        return sendError("Incorrect password", 401);
      }
      throw err;
    }

    const user = await fetchTelegramUser(client);
    const finalSessionString = client.session.save() as unknown as string;

    const dbUser = await userRepository.upsert({
      telegramId: user.telegramId,
      telegramSessionString: finalSessionString,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl,
      phone: phoneNumber,
    });

    await pendingLoginRepository.delete(savedData.id);
    await client.disconnect();

    await createSession({
      ...dbUser,
      userId: String(dbUser.id),
    });

    return sendSuccess({ step: "success", user: dbUser });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);

    await client.disconnect().catch(() => {});
    console.error("Password verify failed:", errMsg ?? err);
    return sendError(errMsg ?? "Password verification failed", 500);
  } finally {
    await client.disconnect().catch(() => {});
  }
}
