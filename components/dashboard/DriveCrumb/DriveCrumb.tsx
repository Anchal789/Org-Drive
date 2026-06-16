'use client';

import { useRouter } from 'next/navigation';
import Btn from '@/components/ui/btn';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { iconsWithPaths } from '@/constants/common-constants';
import { useFileLayout } from '@/store/store';
import styles from './DriveCrumb.module.scss';

export default function DriveCrumb({ inFolder }: { inFolder?: string }) {
  const { fileLayout, setFileLayout } = useFileLayout();
  const router = useRouter();
  return (
    <div className={styles.crumb}>
      <div className={styles.title}>
        {inFolder ? (
          <>
            <Button
              type="button"
              className={styles.parentLink}
              onClick={() => {
                router.push('/my-drive');
              }}
            >
              My drive
            </Button>
            <Icon
              d={iconsWithPaths.chev}
              size={14}
              className={styles.chevron}
            />
            <span>{inFolder}</span>
            <Icon
              d={iconsWithPaths.chevDown}
              size={14}
              className={styles.chevron}
            />
          </>
        ) : (
          <>
            <span>My drive</span>
            <Icon
              d={iconsWithPaths.chevDown}
              size={14}
              className={styles.chevron}
            />
          </>
        )}
      </div>
      <div className={styles.actions}>
        <Btn
          variant={fileLayout === 'list' ? 'default' : 'ghost'}
          size="icon"
          icon={iconsWithPaths.list}
          onClick={() => setFileLayout('list')}
        />
        <Btn
          variant={fileLayout === 'grid' ? 'default' : 'ghost'}
          size="icon"
          icon={iconsWithPaths.grid}
          onClick={() => setFileLayout('grid')}
        />
        <span className={styles.divider} />
        <Btn variant="ghost" size="icon" icon={iconsWithPaths.settings} />
      </div>
    </div>
  );
}
