'use client';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '../ui/button';
import styles from './DriveSidebar.module.scss';

export function OrgPill() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  return (
    <Button
      type="button"
      className={`${styles.orgPill} ${collapsed ? styles.orgPillCollapsed : ''}`}
    >
      <div className={styles.orgLogo}>Z</div>
      {!collapsed && <span className={styles.orgName}>Zuru Tech</span>}
    </Button>
  );
}
