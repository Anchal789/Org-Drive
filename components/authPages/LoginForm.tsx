import PhoneLogin from './PhoneLogin';
import { TelegramQrDisplayPanel } from './TelegramQrDisplayPanel';

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'var(--font-sans)',
      }}
      data-screen-label="00 Login · Split hero"
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 380,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {/* Header */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--tg-blue)',
              }}
            >
              Login
            </div>

            <h2
              style={{
                fontSize: 26,
                fontWeight: 600,
                marginTop: 4,
                marginBottom: 6,
                letterSpacing: '-0.02em',
              }}
            >
              Welcome back.
            </h2>

            <p
              style={{
                fontSize: 13,
                color: 'var(--muted-foreground)',
                margin: 0,
              }}
            >
              Enter your phone — we'll send a code via Telegram.
            </p>
          </div>

          <PhoneLogin />

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              margin: '8px 0',
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: 'var(--border)',
              }}
            />

            <span
              style={{
                fontSize: 11,
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 500,
              }}
            >
              or scan QR
            </span>

            <div
              style={{
                flex: 1,
                height: 1,
                background: 'var(--border)',
              }}
            />
          </div>

          <TelegramQrDisplayPanel />
        </div>
      </div>
    </div>
  );
}
