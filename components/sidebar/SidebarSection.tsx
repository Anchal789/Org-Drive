'use client';
import { useSidebar } from '@/components/ui/sidebar';
import type { SidebarItemProps } from '@/types/component-types';
import styles from './DriveSidebar.module.scss';
import SidebarItem from './SidebarItem';

export function SidebarSection({
  label,
  items,
}: {
  label: string;
  items: SidebarItemProps[];
}) {
  const { state } = useSidebar();
  if (state === 'collapsed') return null;
  return (
    <>
      <div className={styles.sectionLabel}>{label}</div>
      <nav className={styles.nav}>
        {items.map((item) => (
          <SidebarItem key={item.label} item={item} />
        ))}
      </nav>
    </>
  );
}
