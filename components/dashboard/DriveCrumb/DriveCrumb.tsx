'use client';

import { ChevronDown, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useIsTab } from '@/hooks/use-mobile';
import { useFileLayout } from '@/store/store';
import styles from './DriveCrumb.module.scss';
import LayoutSettings from './LayoutSettings';

export default function DriveCrumb() {
  const { fileLayout, setFileLayout } = useFileLayout();
  const router = useRouter();
  const isTab = useIsTab();
  const searchParams = useSearchParams();
  const folderName = searchParams.get('folderName');

  const handleChangeDriveLayout = (layout: 'list' | 'grid') => {
    setFileLayout(layout);
  };

  return (
    <div className={styles.crumb}>
      {!isTab && (
        <div className={styles.title}>
          {folderName ? (
            <>
              <Button
                type='button'
                className={styles.parentLink}
                onClick={() => {
                  router.replace('/my-drive');
                }}
              >
                My drive
              </Button>
              <ChevronRight size={14} className={styles.chevron} />
              <span>{folderName}</span>
            </>
          ) : (
            <>
              <span>My drive</span>
              <ChevronDown size={14} className={styles.chevron} />
            </>
          )}
        </div>
      )}
      <div className={styles.actions}>
        {!isTab && (
          <>
            <Button
              type='button'
              variant={fileLayout === 'list' ? 'primary' : 'ghost'}
              size='icon'
              onClick={() => handleChangeDriveLayout('list')}
            >
              <List size={16} />
            </Button>
            <Button
              type='button'
              variant={fileLayout === 'grid' ? 'primary' : 'ghost'}
              size='icon'
              onClick={() => handleChangeDriveLayout('grid')}
            >
              <LayoutGrid size={16} />
            </Button>
          </>
        )}
        <span className={styles.divider} />
        <LayoutSettings />
      </div>
    </div>
  );
}
