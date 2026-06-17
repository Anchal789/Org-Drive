import { DRIVE_FILES, DRIVE_FOLDERS } from '@/constants/dashboard-constants';
import styles from '@/styles/components/DashGrid.module.scss';
import DriveTopbar from '../../Header/DriveTopbar';
import DriveCrumb from '../DriveCrumb/DriveCrumb';
import FileCard from '../FileSection/FileCard';
import FolderTile from '../FolderSection/FolderTile';
import ShareDialog from '../ShareDialog';

export default function DashGridShare() {
  return (
    <div className={styles.shell} data-screen-label="02 Drive · Share dialog">
      <div className={styles.main}>
        <DriveTopbar />
        <DriveCrumb />
        <div className={styles.content}>
          <div className={styles.sectionLabel}>Suggested</div>
          <div className={`${styles.grid} ${styles.grid4}`}>
            {DRIVE_FILES.slice(0, 4).map((file) => (
              <FileCard key={file.id} file={file} big />
            ))}
          </div>

          <div className={`${styles.sectionLabel} ${styles.spaced}`}>
            Folders
          </div>
          <div className={`${styles.grid} ${styles.grid4}`}>
            {DRIVE_FOLDERS.map((folder) => (
              <FolderTile key={folder.name} folder={folder} />
            ))}
          </div>
        </div>
        <ShareDialog />
      </div>
    </div>
  );
}
