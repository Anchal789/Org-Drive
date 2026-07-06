'use client';

import { formatBytes } from '@/store/store';
import Ring from '../ui/ring';
import { SidebarFooter, useSidebar } from '../ui/sidebar';
import styles from './DriveSidebar.module.scss';

export function StorageCard({ totalSize }: { totalSize: number }) {
  const { state } = useSidebar();

  if (state === 'collapsed') return null;
  return (
    <SidebarFooter className={styles.footerReset}>
      <div className={styles.storage} data-hide-collapsed>
        <Ring pct={64} size={44} color="var(--primary)" />
        <div className={styles.storageInfo}>
          <div className={styles.storageLabel}>Telegram channel</div>
          <div className={styles.storageUsed}>
            {formatBytes(totalSize)} used
          </div>
          <div className={styles.storageCap}>of effectively ∞</div>
        </div>
      </div>
    </SidebarFooter>
  );
}
