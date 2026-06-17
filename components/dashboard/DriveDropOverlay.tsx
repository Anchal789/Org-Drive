'use client';

import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { iconsWithPaths } from '@/constants/common-constants';
import styles from '@/styles/components/DriveDropOverlay.module.scss';
import Dropzone from '../ui/dropzone';

export default function DriveDropOverlay() {
  const [isDragging, setIsDragging] = useState(false);
  return (
    <div
      className={`${styles.overlay} ${isDragging ? styles.overlayActive : ''}`}
    >
      <div className={styles.inner}>
        <Dropzone onDraggingAction={setIsDragging} />
        <div className={styles.iconBox}>
          <Icon d={iconsWithPaths.upload} size={28} stroke={2} />
        </div>
        <div className={styles.title}>Drop to upload</div>
        <div className={styles.subtitle}>
          3 files · ~14 MB · into Engineering
        </div>
      </div>
    </div>
  );
}
