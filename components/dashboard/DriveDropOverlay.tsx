'use client';

import { Upload, X } from 'lucide-react';
import { useDragDropStore } from '@/store/store';
import { Button } from '../ui/button';
import Dropzone from '../ui/dropzone';
import styles from './DriveDropOverlay.module.scss';

export default function DriveDropOverlay() {
  const { isDragging, setIsDragging } = useDragDropStore();
  return (
    <>
      <Button
        type='button'
        variant={'outline'}
        size={'lg'}
        className={styles.closeOverlay}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
      >
        <X size={20} color='var(--primary)' />
        Close
      </Button>
      <div
        className={`${styles.overlay} ${isDragging ? styles.overlayActive : ''}`}
      >
        <div className={styles.inner}>
          <Dropzone onDraggingAction={setIsDragging} />
          <div className={styles.iconBox}>
            <Upload size={28} />
          </div>
          <div className={styles.title}>Drop to upload</div>
          <div className={styles.subtitle}>
            3 files · ~14 MB · into Engineering
          </div>
        </div>
      </div>
    </>
  );
}
