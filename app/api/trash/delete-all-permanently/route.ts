export const dynamic = "force-dynamic";

import { sendError, sendSuccess } from "@/lib/api-response";
import { getSessionUser } from "@/lib/session";
import { userRepository } from "@/repositories/user.repository";
import { trashedItemsRepository } from "@/repositories/trashed-items.repository";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);
const STORAGE_CHANNEL = String(process.env.TELEGRAM_STORAGE_CHANNEL_ID);

export async function DELETE() {
  const session = await getSessionUser();
  if (!session?.userId) return sendError("Unauthorized", 401);

  const dbUser = await userRepository.findById(Number(session.userId));
  if (!dbUser?.telegramSessionString) return sendError("Session invalid", 401);
  const telegramMessageIds = await trashedItemsRepository.emptyTrash(
    Number(session.userId),
  );

  if (telegramMessageIds.length === 0) {
    return sendSuccess(null, "Trash is already empty", 200);
  }

  let client: TelegramClient | null = new TelegramClient(
    new StringSession(dbUser.telegramSessionString),
    API_ID,
    API_HASH,
    { connectionRetries: 1 },
  );

  try {
    await client.connect();
    await client.deleteMessages(STORAGE_CHANNEL, telegramMessageIds, {
      revoke: true,
    });

    return sendSuccess(
      null,
      `Permanently deleted ${telegramMessageIds.length} items`,
      200,
    );
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("BULK TELEGRAM DELETE ERROR:", errMsg);
    if (errMsg?.includes("AUTH_KEY_UNREGISTERED")) {
      return sendError("Telegram session expired.", 401);
    }
    return sendError(
      "Database cleared, but failed to free Telegram space",
      500,
    );
  } finally {
    if (client) await client.disconnect().catch(() => {});
  }
}
