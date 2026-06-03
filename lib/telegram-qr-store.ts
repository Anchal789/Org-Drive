// In-memory store for QR login attempts. Swap this to Redis for production.
// Each entry is keyed by a random loginId and holds the session string + metadata.

type QRLoginEntry = {
  sessionString: string;
  createdAt: number;
};

// Module-level Map — survives between requests as long as the Node process is alive.
// On Vercel, this DOES NOT WORK (each request is a fresh function). Use Redis there.
const store = new Map<string, QRLoginEntry>();

// Clean up entries older than 5 minutes to prevent memory leaks
const TTL_MS = 5 * 60 * 1000;

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.createdAt > TTL_MS) {
      store.delete(key);
    }
  }
}

export const qrStore = {
  set(loginId: string, sessionString: string) {
    cleanup();
    store.set(loginId, { sessionString, createdAt: Date.now() });
  },
  get(loginId: string): string | null {
    cleanup();
    return store.get(loginId)?.sessionString ?? null;
  },
  update(loginId: string, sessionString: string) {
    const entry = store.get(loginId);
    if (entry) {
      store.set(loginId, { ...entry, sessionString });
    }
  },
  delete(loginId: string) {
    store.delete(loginId);
  },
};
