"use server";
import { cookies } from "next/headers";
import { generateRefreshToken, verifyToken } from "./jwt";
import { TelegramUser } from "@/types/auth";

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
