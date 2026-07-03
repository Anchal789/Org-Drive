export const dynamic = "force-dynamic";

import { sendError, sendSuccess } from "@/lib/api-response";
import { getApiSession } from "@/lib/session";
import { decrypt } from "@/lib/utils";
import { systemSettingsRepository } from "@/repositories/system-settings.repository";
import { trashedItemsRepository } from "@/repositories/trashed-items.repository";
import { NextRequest } from "next/server";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);
const STORAGE_CHANNEL = String(process.env.TELEGRAM_STORAGE_CHANNEL_ID);

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trashId = decrypt(searchParams.get("id") || "");

  if (!trashId) return sendError("Missing id", 400);

  const session = await getApiSession(request);

  if (!session || !session.userId) {
    return sendError("Access token missing or expired", 401);
  }

  const telegramMessageIds = await trashedItemsRepository.permanentlyDeleteItem(
    Number(session.userId),
    Number(trashId),
    true,
  );

  if (!telegramMessageIds) {
    return sendError("Item not found in trash", 404);
  }

  if (telegramMessageIds.length === 0) {
    await trashedItemsRepository.permanentlyDeleteItem(
      Number(session.userId),
      Number(trashId),
      false,
    );

    return sendSuccess(null, "Item deleted permanently", 200);
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

    await trashedItemsRepository.permanentlyDeleteItem(
      Number(session.userId),
      Number(trashId),
      false,
    );

    return sendSuccess(null, "Item deleted permanently", 200);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("SINGLE TELEGRAM DELETE ERROR:", errMsg);

    if (errMsg?.includes("AUTH_KEY_UNREGISTERED")) {
      return sendError("Telegram session expired.", 401);
    }

    return sendError(`Telegram Error: ${errMsg}. (Database protected)`, 500);
  } finally {
    if (client) {
      await client.disconnect().catch(() => {});
    }
  }
}
