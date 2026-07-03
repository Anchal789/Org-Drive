import type { TelegramClient } from "telegram";
import type { OTPLoginEntry, TelegramUser, User } from "@/types/auth";

const store = new Map<string, OTPLoginEntry>();
const TTL_MS = 5 * 60 * 1000;

async function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.createdAt > TTL_MS) {
      try {
        await entry.client.disconnect();
      } catch {}
      store.delete(key);
    }
  }
}

export const otpStore = {
  set(
    loginId: string,
    client: TelegramClient,
    phoneNumber: string,
    phoneCodeHash: string,
  ) {
    cleanup();
    store.set(loginId, {
      client,
      phoneNumber,
      phoneCodeHash,
      createdAt: Date.now(),
      status: "waiting",
      user: null,
      error: null,
      passwordHint: null,
    });
  },

  get(loginId: string) {
    return store.get(loginId) ?? null;
  },

  markNeedsPassword(loginId: string, hint: string | null) {
    const entry = store.get(loginId);
    if (entry) {
      entry.status = "needs_password";
      entry.passwordHint = hint;
    }
  },

  markSuccess(loginId: string, user: TelegramUser) {
    const entry = store.get(loginId);
    if (entry) {
      entry.status = "success";
      entry.user = user as User;
    }
  },

  markError(loginId: string, error: string) {
    const entry = store.get(loginId);
    if (entry) {
      entry.status = "error";
      entry.error = error;
    }
  },

  async delete(loginId: string) {
    const entry = store.get(loginId);
    if (entry) {
      try {
        await entry.client.disconnect();
      } catch {}
      store.delete(loginId);
    }
  },
};
