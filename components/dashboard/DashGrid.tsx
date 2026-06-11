import { getSessionUser } from "@/lib/session";
import DriveCrumb from "./DriveCrumb";
import DriveTopbar from "./DriveTopbar";
import FileCard from "./FileSection/FileCard";
import FolderTile from "./FolderTile";
import UploadWidget from "./UploadWidget";
import { DRIVE_FILES, DRIVE_FOLDERS } from "@/constants/dashboard-constants";
import styles from "@/styles/components/DashGrid.module.scss";
import { uploadedFilesRepository } from "@/repositories/uploaded-files.respository";
import { UploadedFile } from "@/types/files";

export default async function DashGrid() {
  const user = await getSessionUser();
  const files = (await uploadedFilesRepository.getFiles(
    Number(user?.userId),
  )) as Array<UploadedFile>;
  return (
    <div className={styles.shell} data-screen-label="02 Drive · Home (grid)">
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

          <div className={`${styles.sectionLabel} ${styles.spaced}`}>Files</div>
          <div className={`${styles.grid} ${styles.grid4}`}>
            {files.map((file) => (
              <FileCard key={file.id} file={file} user={user} />
            ))}
          </div>
        </div>

        <UploadWidget />
      </div>
    </div>
  );
}
