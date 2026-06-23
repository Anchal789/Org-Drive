export const dynamic = "force-dynamic";

import type { UploadedFile, UploadedFolder } from "@/types/files";
import DriveCrumb from "../DriveCrumb/DriveCrumb";
import styles from "./DashList.module.scss";
import FileTable from "./FileTable";
import FolderContainer from "../FolderSection/FolderContainer";

export default function DashList({
  files,
  folders,
}: {
  files: Array<UploadedFile>;
  folders: Array<UploadedFolder>;
}) {
  return (
    <div className={styles.shell}>
      <div className={styles.main}>
        <DriveCrumb />

        <div className={styles.content}>
          {/* Folders row */}
          <div className={styles.sectionLabel}>Folders · {folders?.length}</div>
          <div className={styles.foldersGrid}>
            {folders.length === 0 && (
              <div className={styles.emptyHint}>No folders</div>
            )}
            {folders?.map((folder) => (
              <FolderContainer key={folder.id} folder={folder} layout="list" />
            ))}
          </div>

          {/* Files table */}
          <FileTable files={files} />
        </div>
      </div>
    </div>
  );
}
