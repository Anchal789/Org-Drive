export const dynamic = "force-dynamic";

import { sendError } from "@/lib/api-response";
import { getSessionUser } from "@/lib/session";
import { decrypt } from "@/lib/utils";
import { trashedItemsRepository } from "@/repositories/trashed-items.repository";
import { userRepository } from "@/repositories/user.repository";
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

  const session = await getSessionUser();
  if (!session?.userId) return sendError("Unauthorized", 401);

  const dbUser = await userRepository.findById(Number(session.userId));
  if (!dbUser?.telegramSessionString) return sendError("Session invalid", 401);

  const telegramMessageId = await trashedItemsRepository.permanentlyDeleteFile(
    Number(session.userId),
    Number(trashId),
  );

  if (!telegramMessageId) {
    return sendError("File not found in trash", 404);
  }

  let client: TelegramClient | null = new TelegramClient(
    new StringSession(dbUser.telegramSessionString),
    API_ID,
    API_HASH,
    { connectionRetries: 1 },
  );

  try {
    await client.connect();
    await client.deleteMessages(STORAGE_CHANNEL, [Number(telegramMessageId)], {
      revoke: true,
    });

    return new Response(
      JSON.stringify({ message: "File permanently deleted" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg?.includes("AUTH_KEY_UNREGISTERED")) {
      return sendError("Telegram session expired.", 401);
    }
    return sendError(
      "Removed from drive, but failed to free Telegram space",
      500,
    );
  } finally {
    if (client) {
      await client.disconnect().catch(() => {});
    }
  }
}
