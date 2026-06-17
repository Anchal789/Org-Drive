"use server";
import { cookies } from "next/headers";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { userRepository } from "@/repositories/user.repository";
import type { TelegramUser } from "@/types/auth";
import { generateRefreshToken, verifyToken } from "./jwt";

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);
const REFRESH_TOKEN = "refresh_token";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isSessionPayload(
  payload: unknown,
): payload is TelegramUser & { userId: string } {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "userId" in payload &&
    "telegramId" in payload &&
    "firstName" in payload &&
    "lastName" in payload &&
    "username" in payload &&
    "photoUrl" in payload
  );
}

export async function createSession(props: TelegramUser & { userId: string }) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const cookieStore = await cookies();

  const token = await generateRefreshToken(
    props.userId,
    props.telegramId,
    props.firstName,
    props.lastName,
    props.username,
    props.photoUrl,
  );

  cookieStore.set(REFRESH_TOKEN, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSessionUser(): Promise<
  (TelegramUser & { userId: string }) | null
> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) return null;

  const payload = await verifyToken(refreshToken);

  if (!payload || !isSessionPayload(payload)) return null;

  return payload;
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(REFRESH_TOKEN);
}

export async function isTelegramSessionValid(): Promise<{
  valid: boolean;
  message: string;
}> {
  let client: TelegramClient | null = null;

  const session = await getSessionUser();
  const dbUser = await userRepository.findById(Number(session?.userId));

  client = new TelegramClient(
    new StringSession(dbUser?.telegramSessionString),
    API_ID,
    API_HASH,
    { connectionRetries: 1 },
  );

  try {
    await client.connect();
    await client.getDialogs({ limit: 20 });
    return { valid: true, message: "Session valid" };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (client) await client.disconnect().catch(() => {});
    if (errMsg?.includes("AUTH_KEY_UNREGISTERED")) {
      return {
        valid: false,
        message: "Telegram session expired. Please log in again.",
      };
    }
    return {
      valid: false,
      message: "Failed to connect to Telegram infrastructure",
    };
  }
}
