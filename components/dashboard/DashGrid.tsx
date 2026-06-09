import DriveCrumb from "./DriveCrumb";
import DriveDropOverlay from "./DriveDropOverlay";
import DriveTopbar from "./DriveTopbar";
import FileCard from "./FileCard";
import FolderTile from "./FolderTile";
import UploadWidget from "./UploadWidget";
import { DRIVE_FILES, DRIVE_FOLDERS } from "@/constants/dashboard-constants";
import styles from "@/styles/components/DashGrid.module.scss";

type DashGridProps = {
  showDropOverlay?: boolean;
};

export default function DashGrid({ showDropOverlay = false }: DashGridProps) {
  return (
    <div className={styles.shell} data-screen-label="02 Drive · Home (grid)">
      <div className={styles.main}>
        {!showDropOverlay && (
          <>
            <DriveTopbar />
            <DriveCrumb />
          </>
        )}
        {showDropOverlay && <DriveDropOverlay />}

        {!showDropOverlay && (
          <div className={styles.content}>
            {/* Suggested */}
            <div className={styles.sectionLabel}>Suggested</div>
            <div className={`${styles.grid} ${styles.grid4}`}>
              {DRIVE_FILES.slice(0, 4).map((file) => (
                <FileCard key={file.id} file={file} big />
              ))}
            </div>

            {/* Folders */}
            <div className={styles.sectionHeader}>
              <div className={styles.sectionLabel}>Folders</div>
              <span className={styles.sectionMeta}>
                Top-level only · no nesting
              </span>
            </div>
            <div className={`${styles.grid} ${styles.grid4}`}>
              {DRIVE_FOLDERS.map((folder) => (
                <FolderTile key={folder.name} folder={folder} />
              ))}
            </div>

            {/* Files */}
            <div className={`${styles.sectionLabel} ${styles.spaced}`}>
              Files
            </div>
            <div className={`${styles.grid} ${styles.grid4}`}>
              {DRIVE_FILES.slice(4).map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          </div>
        )}

        {/* <UploadWidget /> */}
      </div>
    </div>
  );
}
