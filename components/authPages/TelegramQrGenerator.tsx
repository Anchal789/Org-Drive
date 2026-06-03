import { iconsWithPaths, TG_BLUE } from '@/constants/common-constants';
import Icon from '../ui/Icon';
import QrCode from './QrCode';
import ContinueWithTelegramButton from './ContinueWithTelegramButton';

export default function TelegramQrGenerator() {
  return (
    <div
      style={{
        height: '100dvh',
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}
      data-screen-label="00 Login · Centered QR"
    >
      <div
        style={{
          width: 440,
          padding: 40,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--foreground)',
              color: 'var(--background)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            OD
          </div>
          <div style={{ width: 24, height: 1, background: 'var(--border)' }} />
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: TG_BLUE,
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon d={iconsWithPaths.send} size={17} stroke={2.4} />
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 600,
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
            }}
          >
            Sign in to Org Drive
          </h2>
          <p
            style={{
              fontSize: 13,
              color: 'var(--muted-foreground)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Scan the QR with the Telegram app, or tap the button below.
          </p>
        </div>

        <div
          style={{
            padding: 14,
            background: '#fff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
          }}
        >
          <QrCode />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            margin: '4px 0',
          }}
        >
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span
            style={{
              fontSize: 11,
              color: 'var(--muted-foreground)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 500,
            }}
          >
            or
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <ContinueWithTelegramButton />

        <div
          style={{
            fontSize: 11,
            color: 'var(--muted-foreground)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          By continuing you agree to the{' '}
          <span
            style={{ color: 'var(--foreground)', textDecoration: 'underline' }}
          >
            Terms
          </span>{' '}
          and{' '}
          <span
            style={{ color: 'var(--foreground)', textDecoration: 'underline' }}
          >
            Privacy Policy
          </span>
          .
        </div>
      </div>
    </div>
  );
}
