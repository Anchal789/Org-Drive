'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { Button } from '@/components/ui/button';
import styles from './LoadMore.module.scss';

type Props = {
  loadMoreFolders: () => Promise<void>;
  showLessFolders: () => void;
  loadingFolders: boolean;
  hasMoreFolders: boolean;
  localFolders: number;
};

const LoadMoreFolder: FunctionComponent<Props> = ({
  hasMoreFolders,
  loadMoreFolders,
  loadingFolders,
  showLessFolders,
  localFolders,
}) => {
  return (
    <div className={styles.loadMoreContainer}>
      {hasMoreFolders && (
        <Button
          variant='primary'
          onClick={loadMoreFolders}
          disabled={loadingFolders}
        >
          <ChevronDown size={14} />{' '}
          {loadingFolders ? 'Loading...' : 'Load more folders'}
        </Button>
      )}
      {localFolders > 5 && (
        <Button variant='secondary' onClick={showLessFolders}>
          <ChevronUp size={14} /> Show less
        </Button>
      )}
    </div>
  );
};

export default LoadMoreFolder;
