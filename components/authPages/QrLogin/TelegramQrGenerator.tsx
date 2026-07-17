'use client';

import { Send } from 'lucide-react';
import TelegramButton from '@/components/ui/telegram-button';
import QrCode from './QrCode';
import styles from './TelegramQrGenerator.module.scss';

export default function TelegramQrGenerator() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.authCard}>
        <div className={styles.logoRow}>
          <div className={styles.brandSquare}>OD</div>
          <div className={styles.dividerLine} />
          <div className={styles.tgCircle}>
            <Send size={17} />
          </div>
        </div>

        <div className={styles.textSection}>
          <h2 className={styles.heading}>Sign in to Org Drive</h2>
          <p className={styles.subheading}>
            Scan the QR with the Telegram app, or tap the button below.
          </p>
        </div>

        <QrCode />

        <div className={styles.orDivider}>
          <div className={styles.orLine} />
          <span className={styles.orText}>or</span>
          <div className={styles.orLine} />
        </div>

        <TelegramButton navigateTo='/login' isNavigatingButton>
          Continue with Telegram
        </TelegramButton>

        <div className={styles.termsText}>
          By continuing you agree to the{' '}
          <span className={styles.termsLink}>Terms</span> and{' '}
          <span className={styles.termsLink}>Privacy Policy</span>.
        </div>
      </div>
    </div>
  );
}
