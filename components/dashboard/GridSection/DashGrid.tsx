export const dynamic = 'force-dynamic';

import Image from 'next/image';
import NoDataImage from '@/public/assets/No-Data.svg';
import type { UploadedFile, UploadedFolder } from '@/types/files';
import FileCard from '../FileSection/FileCard';
import FileSelectionBar from '../FileSection/FileSelectionBar';
import FilesContainer from '../FileSection/FilesContainer';
import FolderContainer from '../FolderSection/FolderContainer';
import styles from './DashGrid.module.scss';
import LoadMore from './LoadMore';

type Props = {
  files: Array<UploadedFile>;
  folders: Array<UploadedFolder>;
  isMobile: boolean;
  loadMoreFiles: () => Promise<void>;
  showLessFiles: () => void;
  loadMoreFolders: () => Promise<void>;
  showLessFolders: () => void;
  loadingFolders: boolean;
  hasMoreFolders: boolean;
  loadingFiles: boolean;
  hasMoreFiles: boolean;
};

export default function DashGrid({
  files,
  folders,
  isMobile,
  ...props
}: Props) {
  return (
    <>
      {files.length === 0 && folders.length === 0 && (
        <div className={styles.emptyHint}>
          <Image
            src={NoDataImage}
            width={350}
            height={350}
            alt='No data'
            loading='eager'
            className={styles.emptyHintImage}
          />
          Drag your files and folders here or use the &apos;New&apos; button to
          upload
        </div>
      )}
      <div className={styles.content}>
        <FileSelectionBar files={files} folders={folders} />
        {!isMobile && files.length > 0 && (
          <>
            <div className={styles.sectionLabel}>Suggested</div>
            <div className={`${styles.grid} ${styles.grid4}`}>
              {files.slice(0, 4).map((file) => (
                <FileCard key={file.id} file={file} big />
              ))}
            </div>
          </>
        )}

        {folders.length > 0 && (
          <>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionLabel}>Folders</div>
              {!isMobile && (
                <span className={styles.sectionMeta}>
                  Top-level only · no nesting
                </span>
              )}
            </div>
            <div className={`${styles.grid} ${styles.gridFolder4}`}>
              {folders.map((folder) => (
                <FolderContainer
                  key={folder.id}
                  folder={folder}
                  layout='grid'
                />
              ))}
            </div>
          </>
        )}

        {files.length > 0 && (
          <>
            <div className={`${styles.sectionLabel} ${styles.spaced}`}>
              Files
            </div>
            <div className={`${styles.grid} ${styles.grid4}`}>
              <FilesContainer files={files} />
            </div>

            <LoadMore
              hasMoreFiles={props.hasMoreFiles}
              hasMoreFolders={props.hasMoreFolders}
              loadMoreFiles={props.loadMoreFiles}
              loadMoreFolders={props.loadMoreFolders}
              loadingFiles={props.loadingFiles}
              loadingFolders={props.loadingFolders}
              showLessFiles={props.showLessFiles}
              showLessFolders={props.showLessFolders}
              localFiles={files.length}
              localFolders={folders.length}
            />
          </>
        )}
      </div>
    </>
  );
}
