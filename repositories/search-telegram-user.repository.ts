// repositories/telegram.repository.ts
import { sendError } from "@/lib/api-response";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);

export const telegramRepository = {
  async searchUsers(sessionString: string, query: string, limit: number = 10) {
    let client = new TelegramClient(
      new StringSession(sessionString),
      API_ID,
      API_HASH,
      { connectionRetries: 1 },
    );

    try {
      await client.connect();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);

      console.error("Telegram connect error:", errMsg);

      if (client) await client.disconnect().catch(() => {});
      if (errMsg?.includes("AUTH_KEY_UNREGISTERED")) {
        return sendError("Telegram session expired. Please log in again.", 401);
      }
      return sendError(errMsg, 500);
    }

    try {
      const result = await client.invoke(
        new Api.contacts.Search({
          q: query,
          limit: limit,
        }),
      );

      // Telegram returns a complex object. We need to filter out channels/bots
      // and map the data into a clean structure for your frontend.
      const users = result.users
        .filter((user) => user instanceof Api.User && !user.bot)
        .map((user: any) => ({
          id: String(user.id),
          accessHash: String(user.accessHash), // You need this if you want to interact with them later!
          username: user.username || null,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phone: user.phone || null,
        }));

      return users;
    } catch (error) {
      console.error("Telegram Search Error:", error);
      throw error;
    } finally {
      await client.disconnect().catch(() => {});
    }
  },
};
