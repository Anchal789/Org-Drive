"use server";
import { cookies } from "next/headers";
import { decrypt, encrypt } from "./utils";

const SESSION_COOKIE = "session_id";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createSession(userId: number) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, encrypt(String(userId)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const id = raw;
  return decrypt(id);
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
