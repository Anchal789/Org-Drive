import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { sendError } from '@/lib/api-response';

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);

export const telegramRepository = {
  async searchUsers(sessionString: string, query: string, limit = 10) {
    const client = new TelegramClient(
      new StringSession(sessionString),
      API_ID,
      API_HASH,
      { connectionRetries: 1 },
    );

    try {
      await client.connect();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);

      if (client)
        await client.disconnect().catch(() => {
          void 0;
        });
      if (errMsg?.includes('AUTH_KEY_UNREGISTERED')) {
        return sendError('Telegram session expired. Please log in again.', 401);
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
      const users = result.users
        .filter(
          (user): user is Api.User => user instanceof Api.User && !user.bot,
        )
        .map((user) => ({
          id: String(user.id),
          accessHash: String(user.accessHash),
          username: user.username || null,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || null,
        }));

      return users;
    } finally {
      await client.disconnect().catch(() => {
        void 0;
      });
    }
  },
};
