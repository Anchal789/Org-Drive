'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { Button } from '@/components/ui/button';
import styles from './LoadMore.module.scss';

type Props = {
  loadMoreFiles: () => Promise<void>;
  showLessFiles: () => void;
  loadingFiles: boolean;
  hasMoreFiles: boolean;
  localFiles: number;
};

const LoadMoreFiles: FunctionComponent<Props> = ({
  hasMoreFiles,
  loadMoreFiles,
  loadingFiles,
  showLessFiles,
  localFiles,
}) => {
  return (
    <div className={styles.loadMoreContainer}>
      {hasMoreFiles && (
        <Button
          variant='primary'
          onClick={loadMoreFiles}
          disabled={loadingFiles}
        >
          <ChevronDown size={14} />{' '}
          {loadingFiles ? 'Loading...' : 'Load more files'}
        </Button>
      )}
      {localFiles > 30 && (
        <Button variant='secondary' onClick={showLessFiles}>
          <ChevronUp size={14} /> Show less
        </Button>
      )}
    </div>
  );
};

export default LoadMoreFiles;
