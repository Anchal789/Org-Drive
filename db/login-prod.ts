// // db/login-prod.ts
// import 'dotenv/config';
// import { TelegramClient } from 'telegram';
// import { StringSession } from 'telegram/sessions';
// import input from 'input';

// async function main() {
//   const apiId = Number(process.env.TELEGRAM_APP_API_ID);
//   const apiHash = String(process.env.TELEGRAM_APP_API_HASH);

//   // NOTE: no setDC, no testServers — this is production
//   const client = new TelegramClient(new StringSession(''), apiId, apiHash, {
//     connectionRetries: 5,
//   });

//   await client.start({
//     phoneNumber: async () =>
//       await input.text('Phone (+countrycode, e.g. +9198...): '),
//     password: async () =>
//       await input.text('2FA password (press enter if none): '),
//     phoneCode: async () => await input.text('Code from your Telegram app: '),
//     onError: (err) => console.log(err),
//   });

//   console.log('LOGGED IN!');
//   console.log('SESSION STRING:', client.session.save());
//   await client.sendMessage('me', { message: 'Hello from GramJS 🎉' });
//   await client.disconnect();
// }

// main();
