import FileType from '@/components/ui/fileType';
import type { FileKind } from '@/types/dashboard';
import type { UploadedFile } from '@/types/files';
import styles from './ShareDialog.module.scss';

interface SelectedItemsListProps {
  files: Array<UploadedFile & { fileName?: string }>;
}

export default function SelectedItemsList({ files }: SelectedItemsListProps) {
  return (
    <div className={styles.multiFilesSection}>
      <div className={styles.sectionLabel}>Selected Items</div>
      <div className={styles.multiFileList}>
        {files.map((f) => {
          const fName = f.name || f.fileName || 'Unknown file';
          const fExt = fName.split('.').pop() as FileKind;
          return (
            <div key={f.id} className={styles.multiFileItem}>
              <FileType kind={fExt} />
              <span className={styles.multiFileName}>{fName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
