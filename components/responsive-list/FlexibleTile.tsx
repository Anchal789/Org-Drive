'use client';

import type { ReactNode } from 'react';
import { Button } from '../ui/button';
import styles from './FlexibleTile.module.scss';

export interface FlexibleTileProps {
  extension?: ReactNode;
  name: string | ReactNode;
  size?: ReactNode;
  folder?: ReactNode;
  date?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;

  isSelected?: boolean;
  onClick?: () => void;
}

export default function FlexibleTile({
  extension,
  name,
  size,
  folder,
  date,
  description,
  actions,
  isSelected = false,
  onClick,
}: FlexibleTileProps) {
  const metaItems = [
    { key: 'size', value: size },
    { key: 'folder', value: folder },
    { key: 'date', value: date },
    { key: 'description', value: description },
  ].filter((item) => Boolean(item.value)) as {
    key: string;
    value: ReactNode;
  }[];

  return (
    <div className={`${styles.tile} ${isSelected ? styles.selected : ''}`}>
      <Button
        type='button'
        tabIndex={0}
        data-slot='file-card'
        className={styles.clickOverlay}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
      />
      {/* ─── LEFT: Checkbox / File Type ─── */}
      {extension && <div className={styles.leading}>{extension}</div>}

      {/* ─── MIDDLE: Auto-Truncating Info ─── */}
      <div className={styles.content}>
        <div
          className={styles.title}
          title={typeof name === 'string' ? name : ''}
        >
          {name}
        </div>

        {metaItems.length > 0 && (
          <div className={styles.metaGroup}>
            {metaItems.map((item, index) => (
              <span
                key={item.key}
                className={styles.metaItem}
                suppressHydrationWarning={item.key === 'date'}
              >
                {item.value}
                {index < metaItems.length - 1 && (
                  <span className={styles.metaDot}>·</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {actions && <div className={styles.trailing}>{actions}</div>}
    </div>
  );
}
