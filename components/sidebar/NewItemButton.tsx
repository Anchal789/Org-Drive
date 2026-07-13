'use client';

import { motion, type PanInfo, useAnimation } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsTab } from '@/hooks/use-mobile';
import { useDragDropStore } from '@/store/store';
import { Button } from '../ui/button';
import styles from './DriveSidebar.module.scss';

export default function NewItemButton({
  fromLayout = false,
}: {
  fromLayout?: boolean;
}) {
  const { isDragging, setIsDragging } = useDragDropStore();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const isTab = useIsTab();

  const controls = useAnimation();

  const [constraints, setConstraints] = useState({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });
  const [travel, setTravel] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isTab) return;

    const updateConstraints = () => {
      const buttonSize = 54;
      const safePadding = 16;
      const originalBottomPadding = 86;

      const xTravel =
        window.innerWidth - buttonSize - safePadding - safePadding;
      const yTravel =
        window.innerHeight - buttonSize - originalBottomPadding - safePadding;

      setTravel({ x: xTravel, y: yTravel });

      setConstraints({
        top: -yTravel,
        left: -xTravel,
        right: 0,
        bottom: 0,
      });
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, [isTab]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const isLeft = info.point.x < window.innerWidth / 2;
    const isTop = info.point.y < window.innerHeight / 2;

    controls.start({
      x: isLeft ? -travel.x : 0,
      y: isTop ? -travel.y : 0,
      transition: { type: 'spring', stiffness: 400, damping: 25 },
    });
  };

  if (fromLayout && !isTab) return null;
  if (isDragging && isTab) return null;

  const buttonContent = (
    <Button
      type='button'
      className={`${styles.newButton} ${collapsed ? styles.newButtonCollapsed : ''}`}
      onClick={() => setIsDragging(!isDragging)}
    >
      <Plus size={16} className={styles.newButtonIcon} />
      {!collapsed && <span className={styles.newButtonText}>New</span>}
    </Button>
  );

  if (isTab) {
    return (
      <motion.div
        drag
        dragConstraints={constraints}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        className={styles.draggableWrapper}
      >
        {buttonContent}
      </motion.div>
    );
  }

  return buttonContent;
}
