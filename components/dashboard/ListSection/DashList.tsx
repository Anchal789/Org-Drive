export const dynamic = 'force-dynamic';

import type { UploadedFile, UploadedFolder } from '@/types/files';
import FolderContainer from '../FolderSection/FolderContainer';
import styles from './DashList.module.scss';
import FileTable from './FileTable';

type FileTableProps = {
  files: Array<UploadedFile>;
  folders: Array<UploadedFolder>;
  loadMoreFiles: () => Promise<void>;
  showLessFiles: () => void;
  loadMoreFolders: () => Promise<void>;
  showLessFolders: () => void;
  loadingFolders: boolean;
  hasMoreFolders: boolean;
  loadingFiles: boolean;
  hasMoreFiles: boolean;
};

export default function DashList({ files, folders }: FileTableProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.main}>
        <div className={styles.content}>
          {/* Folders row */}
          <div className={styles.sectionLabel}>Folders · {folders?.length}</div>
          <div className={styles.foldersGrid}>
            {folders.length === 0 && (
              <div className={styles.emptyHint}>No folders</div>
            )}
            {folders?.map((folder) => (
              <FolderContainer key={folder.id} folder={folder} layout='list' />
            ))}
          </div>

          {/* Files table */}
          <FileTable files={files} folders={folders} />
        </div>
      </div>
    </div>
  );
}
