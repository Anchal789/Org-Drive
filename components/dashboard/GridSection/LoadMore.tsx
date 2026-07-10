'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { Button } from '@/components/ui/button';

type Props = {
  loadMoreFiles: () => Promise<void>;
  showLessFiles: () => void;
  loadMoreFolders: () => Promise<void>;
  showLessFolders: () => void;
  loadingFolders: boolean;
  hasMoreFolders: boolean;
  loadingFiles: boolean;
  hasMoreFiles: boolean;
  localFolders: number;
  localFiles: number;
};

const LoadMore: FunctionComponent<Props> = ({
  hasMoreFiles,
  hasMoreFolders,
  loadMoreFiles,
  loadMoreFolders,
  loadingFiles,
  loadingFolders,
  showLessFiles,
  showLessFolders,
  localFiles,
  localFolders,
}) => {
  return (
    <>
      <div style={{ display: 'flex', gap: '12px', margin: '16px 0' }}>
        {hasMoreFolders && (
          <Button
            variant='outline'
            onClick={loadMoreFolders}
            disabled={loadingFolders}
          >
            <ChevronDown size={14} />{' '}
            {loadingFolders ? 'Loading...' : 'Load more folders'}
          </Button>
        )}
        {localFolders > 5 && (
          <Button variant='ghost' onClick={showLessFolders}>
            <ChevronUp size={14} /> Show less
          </Button>
        )}
      </div>

      {/* --- FILES SECTION --- */}
      {/* ... Map over `localFiles` here instead of `files` ... */}

      <div style={{ display: 'flex', gap: '12px', margin: '16px 0' }}>
        {hasMoreFiles && (
          <Button
            variant='outline'
            onClick={loadMoreFiles}
            disabled={loadingFiles}
          >
            <ChevronDown size={14} />{' '}
            {loadingFiles ? 'Loading...' : 'Load more files'}
          </Button>
        )}
        {localFiles > 30 && (
          <Button variant='ghost' onClick={showLessFiles}>
            <ChevronUp size={14} /> Show less
          </Button>
        )}
      </div>
    </>
  );
};

export default LoadMore;
