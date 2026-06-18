export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { trashedItemsRepository } from "@/repositories/trashed-items.repository";
import { userRepository } from "@/repositories/user.repository";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);
const STORAGE_CHANNEL = String(process.env.TELEGRAM_STORAGE_CHANNEL_ID);

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NEXT_PRIVATE_CRON_SECRET &&
    authHeader !== `Bearer ${process.env.NEXT_PRIVATE_CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const usersToSweep = await trashedItemsRepository.getUsersWithExpiredTrash();
  let totalDeletedFiles = 0;

  for (const userId of usersToSweep) {
    const dbUser = await userRepository.findById(userId);
    if (!dbUser?.telegramSessionString) continue;

    const telegramMessageIds =
      await trashedItemsRepository.processExpiredTrashForUser(userId);

    if (telegramMessageIds.length > 0) {
      let client = new TelegramClient(
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

        totalDeletedFiles += telegramMessageIds.length;
      } catch (error) {
        console.error(`Cron Telegram Error for user ${userId}:`, error);
      } finally {
        await client.disconnect().catch(() => {});
      }
    }
  }

  return NextResponse.json({
    success: true,
    usersSwept: usersToSweep.length,
    filesPermanentlyDeleted: totalDeletedFiles,
  });
}
