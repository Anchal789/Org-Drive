import { Send } from 'lucide-react';
import styles from './LoginPage.module.scss';
import PhoneLogin from './PhoneNumberLogin/PhoneLogin';
import { TelegramQrDisplayPanel } from './QrLogin/TelegramQrDisplayPanel';

export default function LoginPage() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formSection}>
        <div className={styles.formContainer}>
          {/* --- DESKTOP HEADER --- */}
          <div className={styles.desktopHeader}>
            <div className={styles.eyebrow}>Login</div>
            <h2 className={styles.title}>Welcome back.</h2>
            <p className={styles.subtitle}>
              Enter your phone number and we&apos;ll send a code via Telegram.
            </p>
          </div>

          {/* --- MOBILE HEADER --- */}
          <div className={styles.mobileHeader}>
            <div className={styles.logoRow}>
              <div className={styles.logoSquare}>OD</div>
              <span className={styles.logoText}>Org Drive</span>
            </div>

            <span className={styles.telegramBadge}>
              <Send size={10} strokeWidth={2.4} className={styles.badgeIcon} />
              Login with Telegram
            </span>

            <h2 className={styles.mobileTitle}>
              Your files,
              <br />
              on Telegram.
            </h2>
            <p className={styles.mobileSubtitle}>
              Sign in with the Telegram app you already have.
            </p>
          </div>

          {/* Form */}
          <PhoneLogin />

          {/* Divider */}
          <div className={styles.dividerWrapper}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>or scan QR</span>
            <div className={styles.dividerLine} />
          </div>

          {/* QR Panel */}
          <TelegramQrDisplayPanel />
        </div>
      </div>

      {/* --- MOBILE FOOTER --- */}
      <div className={styles.mobileFooter}>
        <p>
          By continuing you agree to the <span>Terms</span> &amp;{' '}
          <span>Privacy</span>.
        </p>
      </div>
    </div>
  );
}
