// db/login-bot.ts
import 'dotenv/config';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

async function main() {
  const client = new TelegramClient(
    new StringSession(''),
    Number(process.env.TELEGRAM_APP_API_ID),
    String(process.env.TELEGRAM_APP_API_HASH),
    { connectionRetries: 5 },
  );
  console.log(process.env.TELEGRAM_BOT_TOKEN);
  await client.start({ botAuthToken: process.env.TELEGRAM_BOT_TOKEN! });
  console.log('BOT LOGGED IN. SESSION:', client.session.save());
  await client.disconnect();
}
main();
