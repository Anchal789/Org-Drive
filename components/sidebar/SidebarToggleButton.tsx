'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '../ui/button';
import styles from './Sidebar.module.scss';

export function SidebarToggleButton() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';
  return (
    <Button
      type='button'
      variant='secondary'
      onClick={toggleSidebar}
      className={styles.sidebarToggleButton}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {collapsed ? (
        <ChevronRightIcon size={14} />
      ) : (
        <ChevronLeftIcon size={14} />
      )}
    </Button>
  );
}
