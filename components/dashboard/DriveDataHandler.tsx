'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { UploadedFile, UploadedFolder } from '@/types/files';

export default function DriveDataHandler({
  files,
  folders,
  fetchMoreData,
  children,
}: {
  files: Array<UploadedFile>;
  folders: Array<UploadedFolder>;
  fetchMoreData(
    type: 'files' | 'folders',
    offset: number,
  ): Promise<UploadedFile[] | UploadedFolder[]>;
  children: (data: {
    files: UploadedFile[];
    folders: UploadedFolder[];
    loadMoreFiles: () => Promise<void>;
    showLessFiles: () => void;
    loadMoreFolders: () => Promise<void>;
    showLessFolders: () => void;
    loadingFolders: boolean;
    hasMoreFolders: boolean;
    loadingFiles: boolean;
    hasMoreFiles: boolean;
  }) => React.ReactNode;
}) {
  const [localFiles, setLocalFiles] = useState<UploadedFile[]>(files);
  const [localFolders, setLocalFolders] = useState<UploadedFolder[]>(folders);

  const [fileOffset, setFileOffset] = useState<number>(30);
  const [folderOffset, setFolderOffset] = useState<number>(30);

  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [hasMoreFiles, setHasMoreFiles] = useState<boolean>(files.length >= 30);

  const [isLoadingFolders, setIsLoadingFolders] = useState<boolean>(false);
  const [hasMoreFolders, setHasMoreFolders] = useState<boolean>(
    folders.length >= 30,
  );
  const handleLoadMoreFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const newFiles = (await fetchMoreData(
        'files',
        fileOffset,
      )) as UploadedFile[];
      if (newFiles.length > 0) {
        setLocalFiles((prev: UploadedFile[]) => [...prev, ...newFiles]);
        setFileOffset((prev) => prev + 30);
      }
      setHasMoreFiles(newFiles.length >= 30);
    } catch {
      toast.error('Failed to load more files.');
    }
    setIsLoadingFiles(false);
  };

  const handleShowLessFiles = () => {
    setLocalFiles(files);
    setFileOffset(30);
    setHasMoreFiles(true);
  };

  const handleLoadMoreFolders = async () => {
    setIsLoadingFolders(true);
    try {
      const newFolders = (await fetchMoreData(
        'folders',
        folderOffset,
      )) as UploadedFolder[];
      if (newFolders.length > 0) {
        setLocalFolders((prev) => [...prev, ...newFolders]);
        setFolderOffset((prev) => prev + 30);
      }
      setHasMoreFolders(newFolders.length >= 30);
    } catch {
      toast.error('Failed to load more folders.');
    }
    setIsLoadingFolders(false);
  };

  const handleShowLessFolders = () => {
    setLocalFolders(folders);
    setFolderOffset(30);
    setHasMoreFolders(true);
  };

  return (
    <>
      {children({
        files: localFiles,
        folders: localFolders,
        loadMoreFiles: handleLoadMoreFiles,
        showLessFiles: handleShowLessFiles,
        loadMoreFolders: handleLoadMoreFolders,
        showLessFolders: handleShowLessFolders,
        loadingFolders: isLoadingFolders,
        hasMoreFolders,
        loadingFiles: isLoadingFiles,
        hasMoreFiles,
      })}
    </>
  );
}
