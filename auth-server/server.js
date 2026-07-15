// auth-server/server.js
require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { computeCheck } = require('telegram/Password');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);

const qrStore = new Map();

async function finalizeLogin(loginId, client) {
  const me = await client.getMe();
  const sessionString = client.session.save();
  qrStore.set(loginId, {
    status: 'success',
    user: {
      telegramId: me.id.toString(),
      telegramSessionString: sessionString,
      firstName: me.firstName,
      lastName: me.lastName,
      username: me.username,
      phone: me.phone,
    },
  });
}

app.post('/api/auth/qr-start', async (_req, res) => {
  const client = new TelegramClient(new StringSession(''), API_ID, API_HASH, {
    connectionRetries: 5,
  });
  try {
    await client.connect();
    const result = await client.invoke(
      new Api.auth.ExportLoginToken({
        apiId: API_ID,
        apiHash: API_HASH,
        exceptIds: [],
      }),
    );

    const qrUrl = `tg://login?token=${result.token.toString('base64url')}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 280, margin: 2 });
    const loginId = uuidv4();

    qrStore.set(loginId, {
      status: 'waiting',
      client,
      qrDataUrl,
      expiresAt: Date.now() + result.expires * 1000,
    });

    client.addEventHandler(async (update) => {
      if (update.className !== 'UpdateLoginToken') return;
      try {
        let finalResult = await client.invoke(
          new Api.auth.ExportLoginToken({
            apiId: API_ID,
            apiHash: API_HASH,
            exceptIds: [],
          }),
        );

        if (finalResult.className === 'auth.LoginTokenMigrateTo') {
          await client._switchDC(finalResult.dcId);
          finalResult = await client.invoke(
            new Api.auth.ImportLoginToken({ token: finalResult.token }),
          );
        }

        if (finalResult.className === 'auth.LoginTokenSuccess') {
          await finalizeLogin(loginId, client);
        }
      } catch (err) {
        if (err.message === 'SESSION_PASSWORD_NEEDED') {
          const pwdInfo = await client.invoke(new Api.account.GetPassword());
          const entry = qrStore.get(loginId);
          entry.status = 'needs_password';
          entry.passwordHint = pwdInfo.hint || null;
        } else {
          qrStore.set(loginId, { status: 'error', error: err.message });
        }
      }
    });

    res.json({
      success: true,
      data: {
        loginId,
        qrDataUrl,
        expiresAt: Date.now() + result.expires * 1000,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/qr-login', async (req, res) => {
  const { loginId } = req.body;
  const entry = qrStore.get(loginId);

  if (!entry)
    return res.status(410).json({ success: false, message: 'Expired' });

  if (entry.status === 'success') {
    const user = entry.user;
    qrStore.delete(loginId);
    return res.json({ success: true, data: { step: 'success', user } });
  }

  if (entry.status === 'needs_password') {
    return res.json({
      success: true,
      data: { step: 'needs_password', passwordHint: entry.passwordHint },
    });
  }

  res.json({
    success: true,
    data: { step: 'waiting', qrDataUrl: entry.qrDataUrl },
  });
});

app.post('/api/auth/qr-password', async (req, res) => {
  const { loginId, password } = req.body;
  const entry = qrStore.get(loginId);

  if (!entry || entry.status !== 'needs_password') {
    return res.status(400).json({ success: false, message: 'Invalid state' });
  }

  try {
    const passwordInfo = await entry.client.invoke(
      new Api.account.GetPassword(),
    );
    const passwordCheck = await computeCheck(passwordInfo, password);
    await entry.client.invoke(
      new Api.auth.CheckPassword({ password: passwordCheck }),
    );

    await finalizeLogin(loginId, entry.client);
    const updated = qrStore.get(loginId);
    qrStore.delete(loginId);

    res.json({ success: true, data: { step: 'success', user: updated.user } });
  } catch {
    res.status(400).json({ success: false, message: 'Incorrect password' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Auth Server running on port ${PORT}`));
