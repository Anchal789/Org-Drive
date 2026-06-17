export const dynamic = "force-dynamic";

import Icon from "@/components/ui/icon";
import { iconsWithPaths, TINTS } from "@/constants/common-constants";
import { getFolderTone } from "@/lib/utils";
import type { SessionUser } from "@/types/auth";
import type { UploadedFile, UploadedFolder } from "@/types/files";
import DriveCrumb from "../DriveCrumb/DriveCrumb";
import styles from "./DashList.module.scss";
import FileTable from "./FileTable";

export default function DashList({
  user,
  files,
  folders,
}: {
  user: SessionUser;
  files: Array<UploadedFile>;
  folders: Array<UploadedFolder>;
}) {
  const folderTone = (folder: UploadedFolder) =>
    TINTS?.[getFolderTone(folder.id)];

  return (
    <div className={styles.shell} data-screen-label="02 Drive · List view">
      <div className={styles.main}>
        <DriveCrumb />

        <div className={styles.content}>
          {/* Folders row */}
          <div className={styles.sectionLabel}>Folders · {folders.length}</div>
          <div className={styles.foldersGrid}>
            {folders.map((folder) => (
              <div key={folder.name} className={styles.folderChip}>
                <Icon
                  d={iconsWithPaths.folder}
                  size={14}
                  fill={folderTone(folder)?.bg}
                  stroke={0}
                />
                <span className={styles.folderName}>{folder.name}</span>
              </div>
            ))}
          </div>

          {/* Files table */}
          <FileTable files={files} user={user} />
        </div>
      </div>
    </div>
  );
}
