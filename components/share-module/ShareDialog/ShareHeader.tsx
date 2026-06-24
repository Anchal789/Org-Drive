import { Button } from "@/components/ui/button";
import FileType from "@/components/ui/fileType";
import Icon from "@/components/ui/icon";
import { iconsWithPaths } from "@/constants/common-constants";
import { FileKind } from "@/types/dashboard";
import styles from "./ShareDialog.module.scss";

interface ShareHeaderProps {
  activeName?: string;
  isSharingFolder: boolean;
  fileName?: string;
  folderId?: number | null;
  isLoading: boolean;
  parentFolderName: string | null;
  onClose: () => void;
}

export default function ShareHeader({
  activeName,
  isSharingFolder,
  fileName,
  folderId,
  isLoading,
  parentFolderName,
  onClose,
}: ShareHeaderProps) {
  let subtitleText = "Standalone File";
  if (isSharingFolder) {
    subtitleText = "Folder";
  } else if (folderId) {
    subtitleText = isLoading
      ? "Loading folder..."
      : `Inside Folder: ${parentFolderName}`;
  }

  const fileExtension = fileName?.split(".")?.[1] as FileKind;

  return (
    <div className={styles.header}>
      {isSharingFolder ? (
        <div className={styles.folderIcon}>
          <Icon d={iconsWithPaths.folder} size={20} fill="currentColor" />
        </div>
      ) : (
        <FileType kind={fileExtension} />
      )}
      <div className={styles.headerInfo}>
        <div className={styles.headerTitle}>Share &quot;{activeName}&quot;</div>
        <div className={styles.headerSubtitle}>{subtitleText}</div>
      </div>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <Icon d={iconsWithPaths.x} size={16} />
      </Button>
    </div>
  );
}
