'use client';

import Link from 'next/link';
import QrSampleImage from '@/components/ui/telegram-qr';
import styles from './TelegramQrDisplayPanel.module.scss';

export function TelegramQrDisplayPanel() {
  return (
    <Link href='/qr-login' className={styles.linkWrapper}>
      <div className={styles.panelCard}>
        <QrSampleImage size={84} />

        <div className={styles.textContainer}>
          <div className={styles.title}>Scan with Telegram</div>

          <div className={styles.subtitle}>
            Open Telegram → Settings → Devices → Link Desktop.
          </div>
        </div>
      </div>
    </Link>
  );
}
