'use client';

import type { FunctionComponent } from 'react';
import Icon from '@/components/ui/icon';
import { iconsWithPaths } from '@/constants/common-constants';
import { useDragDropStore } from '@/store/store';
import styles from '@/styles/components/DriveSidebar.module.scss';

const NewItemButton: FunctionComponent<{ collapsed: boolean }> = ({
  collapsed,
}) => {
  const { isDragging, setIsDragging } = useDragDropStore();
  return (
    <button
      type="button"
      className={`${styles.newButton} ${collapsed ? styles.newButtonCollapsed : ''}`}
      onClick={() => setIsDragging(!isDragging)}
    >
      <Icon d={iconsWithPaths.plus} size={16} stroke={2.2} />
      {!collapsed && <span>New</span>}
    </button>
  );
};

export default NewItemButton;
