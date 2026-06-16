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

  const readDirectory = (directoryEntry: any): Promise<File[]> => {
    return new Promise((resolve, reject) => {
      const reader = directoryEntry.createReader();
      reader.readEntries(async (entries: any[]) => {
        const files: File[] = [];

        for (const entry of entries) {
          if (entry.isFile) {
            const file = await new Promise<File>((res) => entry.file(res));
            files.push(file);
          } else if (entry.isDirectory) {
            reject(new Error('Nested folders are not allowed.'));
            return;
          }
        }
        resolve(files);
      });
    });
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    handleDrag(false);

    const items = e.dataTransfer.items;
    let extractedFiles: File[] = [];
    let folderName = '';

    try {
      const promises = Array.from(items).map(async (item) => {
        const entry = item.webkitGetAsEntry();
        if (!entry) return;

        if (entry.isFile) {
          const file = item.getAsFile();
          if (file) extractedFiles.push(file);
        } else if (entry.isDirectory) {
          folderName = entry.name;
          const filesInFolder = await readDirectory(entry);
          extractedFiles = [...extractedFiles, ...filesInFolder];
        }
      });

      await Promise.all(promises);

      if (extractedFiles.length > 0) {
        startUploads(extractedFiles, folderName, extractedFiles.length);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to read folder contents.');
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

    let folderName;
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
