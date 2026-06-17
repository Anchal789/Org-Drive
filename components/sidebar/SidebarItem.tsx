'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { FunctionComponent } from 'react';
import Badge from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import styles from '@/styles/components/DriveSidebar.module.scss';
import type { SidebarItemProps } from '@/types/component-types';
import { Button } from '../ui/button';

const SidebarItem: FunctionComponent<{
  item: SidebarItemProps;
  collapsed: boolean;
}> = ({ item, collapsed }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = item.url === pathname;
  return (
    <Button
      key={item.label}
      type="button"
      className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
      onClick={() => router.push(item.url)}
    >
      <Icon d={item.icon} size={16} />
      {!collapsed && <span className={styles.navItemLabel}>{item.label}</span>}
      {!collapsed && item.count != null && (
        <span className={styles.navItemCount}>{item.count}</span>
      )}
      {!collapsed && item.badge && (
        <Badge tone="violet" style={{ padding: '1px 6px', fontSize: 9 }}>
          {item.badge}
        </Badge>
      )}
    </Button>
  );
};

export default SidebarItem;
