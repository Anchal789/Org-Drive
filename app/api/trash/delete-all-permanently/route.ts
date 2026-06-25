export const dynamic = "force-dynamic";

import { sendError, sendSuccess } from "@/lib/api-response";
import { getSessionUser } from "@/lib/session";
import { trashedItemsRepository } from "@/repositories/trashed-items.repository";
import { systemSettingsRepository } from "@/repositories/system-settings.repository";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);
const STORAGE_CHANNEL = String(process.env.TELEGRAM_STORAGE_CHANNEL_ID);

export async function DELETE() {
  const session = await getSessionUser();
  if (!session?.userId) return sendError("Unauthorized", 401);

  const telegramMessageIds = await trashedItemsRepository.emptyTrash(
    Number(session.userId),
  );

  if (telegramMessageIds.length === 0) {
    return sendSuccess(null, "Trash is already empty", 200);
  }

  const botSessionString = await systemSettingsRepository.getBotSessionString();
  if (!botSessionString) {
    return sendError("System error: Bot session is not configured.", 500);
  }

  let client: TelegramClient | null = new TelegramClient(
    new StringSession(botSessionString),
    API_ID,
    API_HASH,
    { connectionRetries: 1 },
  );

  try {
    await client.connect();

    let formattedChannelId = STORAGE_CHANNEL.trim();
    if (
      !formattedChannelId.startsWith("@") &&
      !formattedChannelId.startsWith("-100")
    ) {
      formattedChannelId = `-100${formattedChannelId}`;
    }
    const targetEntity = await client.getEntity(formattedChannelId);

    await client.deleteMessages(targetEntity, telegramMessageIds, {
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
