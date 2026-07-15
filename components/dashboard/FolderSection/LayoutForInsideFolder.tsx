'use client';

import type { FunctionComponent } from 'react';
import { useFileLayout, useSortByStore } from '@/store/store';
import type { UploadedFile } from '@/types/files';
import FilesContainer from '../FileSection/FilesContainer';
import FileTable from '../ListSection/FileTable';
import styles from './DashFolder.module.scss';

function getModTime(item: UploadedFile) {
  const date = item.updatedAt || item.createdAt;
  return date ? new Date(date).getTime() : 0;
}

const LayoutForInsideFolder: FunctionComponent<{
  files: Array<UploadedFile>;
}> = ({ files }) => {
  const { fileLayout, hasHydrated } = useFileLayout();
  const { sortBy } = useSortByStore();

  const sortedFiles = [...files];

  switch (sortBy) {
    case 'name':
      sortedFiles.sort((a, b) => a.name.localeCompare(b.name));
      break;

    case 'modified':
      sortedFiles.sort((a, b) => getModTime(b) - getModTime(a));
      break;

    case 'size':
      sortedFiles.sort((a, b) => (b.size || 0) - (a.size || 0));

      break;

    case 'type':
      sortedFiles.sort((a, b) => {
        const typeA = a.mimeType || '';
        const typeB = b.mimeType || '';
        return typeA.localeCompare(typeB);
      });
      break;

    default:
      break;
  }

  const sortedData = { files: sortedFiles };

  if (!hasHydrated) {
    return null;
  }

  return fileLayout === 'grid' ? (
    <div className={styles.filesGrid}>
      <FilesContainer files={sortedData.files} />
    </div>
  ) : (
    <FileTable files={sortedData.files} />
  );
};

export default LayoutForInsideFolder;
