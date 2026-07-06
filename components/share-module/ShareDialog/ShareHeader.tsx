import { Folder, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileType from '@/components/ui/fileType';
import type { FileKind } from '@/types/dashboard';
import styles from './ShareDialog.module.scss';

interface ShareHeaderProps {
  activeName?: string;
  isSharingFolder: boolean;
  fileName?: string;
  folderId?: number | null;
  isLoading: boolean;
  parentFolderName: string | null;
  onClose: () => void;
  isMultiShare?: boolean;
  multiFileCount?: number;
}

export default function ShareHeader({
  activeName,
  isSharingFolder,
  fileName,
  folderId,
  isLoading,
  parentFolderName,
  onClose,
  isMultiShare,
  multiFileCount,
}: ShareHeaderProps) {
  let subtitleText = 'Standalone File';
  if (isMultiShare) {
    subtitleText = 'Multiple Items';
  } else if (isSharingFolder) {
    subtitleText = 'Folder';
  } else if (folderId) {
    subtitleText = isLoading
      ? 'Loading folder...'
      : `Inside Folder: ${parentFolderName}`;
  }

  const fileExtension = fileName?.split('.')?.pop() as FileKind; // Safely gets extension even with multiple dots

  return (
    <div className={styles.header}>
      {isMultiShare ? (
        <div className={styles.folderIcon}>
          <Folder size={20} fill="currentColor" />
        </div>
      ) : isSharingFolder ? (
        <div className={styles.folderIcon}>
          <Folder size={20} fill="currentColor" />
        </div>
      ) : (
        <FileType kind={fileExtension} />
      )}
      <div className={styles.headerInfo}>
        <div className={styles.headerTitle}>
          {isMultiShare
            ? `Share ${multiFileCount} items`
            : `Share "${activeName}"`}
        </div>
        <div className={styles.headerSubtitle}>{subtitleText}</div>
      </div>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X size={16} />
      </Button>
    </div>
  );
}
