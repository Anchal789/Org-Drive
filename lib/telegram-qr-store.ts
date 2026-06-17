import type { TelegramClient } from 'telegram';
import type { QRLoginEntry } from '@/types/auth';

const globalForQRStore = globalThis as unknown as {
  qrLoginStore: Map<string, QRLoginEntry> | undefined;
};

const store: Map<string, QRLoginEntry> =
  globalForQRStore.qrLoginStore ?? new Map<string, QRLoginEntry>();
const TTL_MS = 5 * 60 * 1000;

// if (process.env.NODE_ENV !== "production") {
globalForQRStore.qrLoginStore = store;
// }

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

export const qrStore = {
  set(loginId: string, client: TelegramClient) {
    cleanup();
    store.set(loginId, {
      client,
      createdAt: Date.now(),
      status: 'waiting',
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
      entry.status = 'needs_password';
      entry.passwordHint = hint;
    }
  },

  markSuccess(loginId: string, user: any) {
    const entry = store.get(loginId);
    if (entry) {
      entry.status = 'success';
      entry.user = user;
    }
  },

  markError(loginId: string, error: string) {
    const entry = store.get(loginId);
    if (entry) {
      entry.status = 'error';
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
