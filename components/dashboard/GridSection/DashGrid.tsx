export const dynamic = "force-dynamic";

import type { SessionUser } from "@/types/auth";
import type { UploadedFile, UploadedFolder } from "@/types/files";
import DriveCrumb from "../DriveCrumb/DriveCrumb";
import FileCard from "../FileSection/FileCard";
import FolderContainer from "../FolderSection/FolderContainer";
import styles from "./DashGrid.module.scss";

export default function DashGrid({
  user,
  files,
  folders,
}: {
  user: SessionUser;
  files: Array<UploadedFile>;
  folders: Array<UploadedFolder>;
}) {
  return (
    <>
      <DriveCrumb inFolder="" />

      <div className={styles.content}>
        <div className={styles.sectionLabel}>Suggested</div>
        <div className={`${styles.grid} ${styles.grid4}`}>
          {files.slice(0, 4).map((file) => (
            <FileCard key={file.id} file={file} big user={user} />
          ))}
        </div>

        <div className={styles.sectionHeader}>
          <div className={styles.sectionLabel}>Folders</div>
          <span className={styles.sectionMeta}>
            Top-level only · no nesting
          </span>
        </div>
        <div className={`${styles.grid} ${styles.grid4}`}>
          {folders.map((folder) => (
            <FolderContainer key={folder.id} folder={folder} user={user} />
          ))}
        </div>

        <div className={`${styles.sectionLabel} ${styles.spaced}`}>Files</div>
        <div className={`${styles.grid} ${styles.grid4}`}>
          {files.map((file) => (
            <FileCard key={file.id} file={file} user={user} />
          ))}
        </div>
      </div>
    </>
  );
}
