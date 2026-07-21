'use client';
import {
  Activity,
  Clock,
  Cloud,
  Search,
  Settings,
  Sparkle,
  Tag,
  Trash2,
  Users,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import type { FunctionComponent } from 'react';
import Badge from '@/components/ui/badge';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsTab } from '@/hooks/use-mobile';
import type { SidebarItemProps } from '@/types/component-types';
import { Button } from '../ui/button';
import styles from './DriveSidebar.module.scss';

const SidebarItem: FunctionComponent<{ item: SidebarItemProps }> = ({
  item,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const isMobile = useIsTab();
  const collapsed = state === 'collapsed';
  const isActive = pathname.includes(item.url);

  const ICONS = {
    Cloud,
    Users,
    Clock,
    Tag,
    Trash2,
    Sparkle,
    Search,
    Activity,
    Settings,
  };

  const IconComponent = ICONS[item.icon as keyof typeof ICONS];

  return (
    <Button
      type='button'
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
      onClick={() => {
        router.push(item.url);
        isMobile && toggleSidebar();
      }}
    >
      <IconComponent size={16} />
      {!collapsed && <span className={styles.navItemLabel}>{item.label}</span>}
      {!collapsed && item.count != null && (
        <span className={styles.navItemCount}>{item.count}</span>
      )}
      {!collapsed && item.badge && (
        <Badge tone='violet' style={{ padding: '1px 6px', fontSize: 12 }}>
          {item.badge}
        </Badge>
      )}
    </Button>
  );
};

export default SidebarItem;
