'use client';

import { toast } from 'sonner';
import { useDragDropStore, useUploadStore } from '@/store/store';
import styles from './Component.module.scss';
import { Input } from './input';

export default function Dropzone({
  onDraggingAction,
}: {
  onDraggingAction?: (dragging: boolean) => void;
}) {
  const { setIsDragging } = useDragDropStore();
  const startUploads = useUploadStore((state) => state.startUploads);

  const handleDrag = (value: boolean) => {
    setIsDragging(value);
    onDraggingAction?.(value);
  };

  const readDirectory = (
    directoryEntry: FileSystemDirectoryEntry,
  ): Promise<File[]> => {
    return new Promise((resolve, reject) => {
      const reader = directoryEntry.createReader();
      reader.readEntries(async (entries: FileSystemEntry[]) => {
        if (entries.some((entry) => entry.isDirectory)) {
          reject(new Error('Nested folders are not allowed.'));
          return;
        }

        try {
          const filePromises = entries
            .filter((entry): entry is FileSystemFileEntry => entry.isFile)
            .map((entry) => new Promise<File>((res) => entry.file(res)));

          const files = await Promise.all(filePromises);
          resolve(files);
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });
    });
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    handleDrag(false);

    const items = e.dataTransfer.items;
    let folderName = '';

    try {
      const nestedFiles = await Promise.all(
        Array.from(items).map(async (item): Promise<File[]> => {
          const entry = item.webkitGetAsEntry();
          if (!entry) return [];

          if (entry.isFile) {
            const file = item.getAsFile();
            return file ? [file] : [];
          }

          if (entry.isDirectory) {
            folderName = entry.name;
            const directoryEntry = entry as FileSystemDirectoryEntry;
            const filesInFolder = await readDirectory(directoryEntry);
            return filesInFolder;
          }

          return [];
        }),
      );
      const extractedFiles = nestedFiles.flat();

      if (extractedFiles.length > 0) {
        startUploads(extractedFiles, folderName, extractedFiles.length);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to read folder contents.';
      toast.error(errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    const hasNestedFolders = fileArray.some(
      (file) => file.webkitRelativePath.split('/').length > 2,
    );

    if (hasNestedFolders) {
      toast.error('Nested folders are not allowed.');
      e.target.value = '';
      return;
    }

    let folderName: string | undefined;
    if (fileArray[0].webkitRelativePath) {
      folderName = fileArray[0].webkitRelativePath.split('/')[0];
    }
    startUploads(fileArray, folderName, fileArray.length);
    e.target.value = '';
  };

  return (
    <Input
      type="file"
      multiple
      className={styles.overlayInput}
      onChange={handleChange}
      onDragOver={(e) => {
        e.preventDefault();
        handleDrag(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        handleDrag(false);
      }}
      onDrop={handleDrop}
      {...{ webkitdirectory: 'true' }}
    />
  );
}
