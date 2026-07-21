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
const rawFrontendUrl = process.env.FRONTEND_URL || '';
const cleanFrontendUrl = rawFrontendUrl.replace(/\/$/, '');

const allowedOrigins = [cleanFrontendUrl];
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

const API_ID = Number(process.env.TELEGRAM_APP_API_ID);
const API_HASH = String(process.env.TELEGRAM_APP_API_HASH);
const INTERNAL_SECRET = process.env.AUTH_SERVER_INTERNAL_SECRET;

if (!INTERNAL_SECRET) {
  throw new Error('Missing required env var: AUTH_SERVER_INTERNAL_SECRET');
}

const qrStore = new Map();

// In-memory sliding-window limiter — per-process, matches this service's
// current single-instance deployment. Swap for a shared store (Redis) if
// this is ever run behind more than one replica.
const rateLimitBuckets = new Map();
function checkRateLimit(key, limit, windowMs) {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

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

app.post('/api/auth/qr-start', async (req, res) => {
  const clientIp = req.ip || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(`qr-start:${clientIp}`, 10, 5 * 60 * 1000)) {
    return res
      .status(429)
      .json({ success: false, message: 'Too many QR login attempts' });
  }

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
      expiresAt: result.expires * 1000,
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
        const errMsg = err.errorMessage || err.message;

        if (errMsg === 'SESSION_PASSWORD_NEEDED') {
          const pwdInfo = await client.invoke(new Api.account.GetPassword());
          const entry = qrStore.get(loginId);
          if (entry) {
            entry.status = 'needs_password';
            entry.passwordHint = pwdInfo.hint || null;
          }
        } else {
          const entry = qrStore.get(loginId);
          if (entry) {
            entry.status = 'error';
            entry.error = errMsg;
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        loginId,
        qrDataUrl,
        expiresAt: result.expires * 1000,
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
    // Never send the raw Telegram session string to the browser. The app
    // server fetches it directly, server-to-server, via /internal/qr-result.
    return res.json({
      success: true,
      data: { step: 'success', firstName: entry.user.firstName },
    });
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

    // Never send the raw Telegram session string to the browser. The app
    // server fetches it directly, server-to-server, via /internal/qr-result.
    res.json({
      success: true,
      data: { step: 'success', firstName: updated.user.firstName },
    });
  } catch {
    res.status(400).json({ success: false, message: 'Incorrect password' });
  }
});

// Server-to-server only: the Next.js app fetches the completed Telegram
// session here directly, so the raw session string never transits the
// browser. Guarded by a shared secret instead of the public CORS allowlist.
app.get('/internal/qr-result', (req, res) => {
  if (req.header('x-internal-secret') !== INTERNAL_SECRET) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { loginId } = req.query;
  const entry = qrStore.get(loginId);

  if (!entry || entry.status !== 'success') {
    return res
      .status(404)
      .json({ success: false, message: 'No completed login for this id' });
  }

  qrStore.delete(loginId);
  res.json({ success: true, data: { user: entry.user } });
});

app.get('/', (_req, res) => {
  res.send('Auth server is running');
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth server is running on port ${PORT}`);
});
