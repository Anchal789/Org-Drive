'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSelectedFilesStore } from '@/store/store';
import type { UploadedFile } from '@/types/files';
import FileCard from './FileCard';
import styles from './FileCard.module.scss';

const FilesContainer = ({ files }: { files: Array<UploadedFile> }) => {
  const { selectedFiles, setSelectedFiles, setFileCount } =
    useSelectedFilesStore();
  const selectedIdSet = new Set(selectedFiles.map((f) => f.id));

  const handleToggleSelect = (file: UploadedFile) => {
    const isSelected = selectedIdSet.has(file.id);
    const updatedSelectedFiles = isSelected
      ? selectedFiles.filter((f) => f.id !== file.id)
      : [...selectedFiles, file];

    setSelectedFiles(updatedSelectedFiles);
  };

  useEffect(() => {
    setFileCount(files.length);
  }, [files, setFileCount]);

  return (
    <>
      {files.map((file) => (
        <div key={file.id} className={styles.cardWrapper}>
          <Button
            type='button'
            tabIndex={0}
            data-slot='file-card'
            className={styles.clickOverlay}
            onClick={() => handleToggleSelect(file)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggleSelect(file);
              }
            }}
          />
          <FileCard file={file} isSelected={selectedIdSet.has(file.id)} />
        </div>
      ))}
    </>
  );
};

export default FilesContainer;
