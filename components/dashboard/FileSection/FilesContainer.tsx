'use client';

import { useEffect, useMemo } from 'react';
import { useSelectedFilesStore } from '@/store/store';
import type { UploadedFile } from '@/types/files';
import FileCard from './FileCard';
import styles from './FileCard.module.scss';

const FilesContainer = ({ files }: { files: Array<UploadedFile> }) => {
  const { selectedFiles, setSelectedFiles, setFileCount } =
    useSelectedFilesStore();
  const selectedIds = useMemo(() => {
    return selectedFiles.map((f) => f.id);
  }, [selectedFiles]);

  const handleToggleSelect = (file: UploadedFile) => {
    const isSelected = selectedIds.includes(file.id);
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
        <button
          type='button'
          tabIndex={0}
          key={file.id}
          data-slot='file-card'
          className={styles.cardWrapper}
          onClick={() => handleToggleSelect(file)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggleSelect(file);
            }
          }}
        >
          <FileCard file={file} isSelected={selectedIds.includes(file.id)} />
        </button>
      ))}
    </>
  );
};

export default FilesContainer;
