'use client';

import { type FunctionComponent, useMemo } from 'react';
import { useIsTab } from '@/hooks/use-mobile';
import { useFileLayout, useSortByStore } from '@/store/store';
import type { UploadedFile, UploadedFolder } from '@/types/files';
import DriveDataHandler from './DriveDataHandler';
import DashGrid from './GridSection/DashGrid';
import DashList from './ListSection/DashList';

const SwitchLayout: FunctionComponent<{
  files: Array<UploadedFile>;
  folders: Array<UploadedFolder>;
  fetchMoreData(
    type: 'files' | 'folders',
    offset: number,
  ): Promise<UploadedFile[] | UploadedFolder[]>;
}> = ({ files, folders, fetchMoreData }) => {
  const { fileLayout, hasHydrated } = useFileLayout();
  const { sortBy } = useSortByStore();
  const isMobile = useIsTab();

  const sortedData = useMemo(() => {
    const getModTime = (item: UploadedFile | UploadedFolder) => {
      const date = item.updatedAt || item.createdAt;
      return date ? new Date(date).getTime() : 0;
    };

    const sortedFiles = [...files];
    const sortedFolders = [...folders];

    switch (sortBy) {
      case 'name':
        sortedFiles.sort((a, b) => a.name.localeCompare(b.name));
        sortedFolders.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case 'modified':
        sortedFiles.sort((a, b) => getModTime(b) - getModTime(a));
        sortedFolders.sort((a, b) => getModTime(b) - getModTime(a));
        break;

      case 'size':
        sortedFiles.sort((a, b) => (b.size || 0) - (a.size || 0));
        sortedFolders.sort((a, b) => {
          const sizeA = a.fileCount || 0;
          const sizeB = b.fileCount || 0;
          return sizeA === sizeB ? a.name.localeCompare(b.name) : sizeB - sizeA;
        });
        break;

      case 'type':
        sortedFiles.sort((a, b) => {
          const typeA = a.mimeType || '';
          const typeB = b.mimeType || '';
          return typeA.localeCompare(typeB);
        });
        sortedFolders.sort((a, b) => a.name.localeCompare(b.name));
        break;

      default:
        break;
    }

    return { files: sortedFiles, folders: sortedFolders };
  }, [files, folders, sortBy]);

  if (!hasHydrated) {
    return null;
  }
  return (
    <DriveDataHandler
      key={fileLayout + sortBy}
      files={sortedData.files}
      folders={sortedData.folders}
      fetchMoreData={fetchMoreData}
    >
      {(data) =>
        fileLayout === 'list' ? (
          <DashList {...data} />
        ) : (
          <DashGrid {...data} isMobile={isMobile} />
        )
      }
    </DriveDataHandler>
  );
};

export default SwitchLayout;
