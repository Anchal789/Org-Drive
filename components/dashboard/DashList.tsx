import { Checkbox } from "@/components/ui/checkbox";
import FileType from "@/components/ui/FileType";
import Icon from "@/components/ui/Icon";
import UserAvatar from "@/components/ui/UserAvatar";
import DriveCrumb from "./DriveCrumb";
import DriveTopbar from "./DriveTopbar";
import UploadWidget from "./UploadWidget";
import { iconsWithPaths, TINTS } from "@/constants/common-constants";
import { DRIVE_FILES, DRIVE_FOLDERS } from "@/constants/dashboard-constants";
import styles from "@/styles/components/DashList.module.scss";

export default function DashList() {
  return (
    <div className={styles.shell} data-screen-label="02 Drive · List view">
      <div className={styles.main}>
        <DriveTopbar />
        <DriveCrumb />

        <div className={styles.content}>
          {/* Folders row */}
          <div className={styles.sectionLabel}>
            Folders · {DRIVE_FOLDERS.length}
          </div>
          <div className={styles.foldersGrid}>
            {DRIVE_FOLDERS.map((folder) => (
              <div key={folder.name} className={styles.folderChip}>
                <Icon
                  d={iconsWithPaths.folder}
                  size={14}
                  fill={TINTS[folder.tone].bd}
                  stroke={0}
                />
                <span className={styles.folderName}>{folder.name}</span>
              </div>
            ))}
          </div>

          {/* Files table */}
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>
                <Checkbox indeterminate />
              </span>
              <span className={styles.sortable}>
                Name <Icon d={iconsWithPaths.chevDown} size={10} />
              </span>
              <span>Type</span>
              <span>Owner</span>
              <span>Modified</span>
              <span>Size</span>
              <span />
            </div>
            {DRIVE_FILES.map((file, i) => (
              <div
                key={file.id}
                className={`${styles.tableRow} ${i === DRIVE_FILES.length - 1 ? styles.tableRowLast : ""}`}
              >
                <Checkbox checked={i === 1 || i === 3} />
                <div className={styles.fileCell}>
                  <FileType kind={file.kind} />
                  <span className={styles.fileName}>{file.name}</span>
                  {file.starred && (
                    <Icon
                      d={iconsWithPaths.star}
                      size={12}
                      style={{
                        color: TINTS.amber.bd,
                        fill: TINTS.amber.bg,
                      }}
                    />
                  )}
                </div>
                <span className={styles.kindCell}>{file.kind}</span>
                <div className={styles.ownerCell}>
                  <UserAvatar
                    initials={file.owner[0]}
                    tone={file.owner[1]}
                    size="sm"
                  />
                  <span className={styles.ownerName}>
                    {file.owner[0] === "MK" ? "me" : file.owner[0]}
                  </span>
                </div>
                <span className={styles.metaCell}>{file.mod}</span>
                <span className={styles.metaCell}>{file.size}</span>
                <Icon
                  d={iconsWithPaths.more}
                  size={14}
                  style={{ color: "var(--muted-foreground)" }}
                />
              </div>
            ))}
          </div>
        </div>

        <UploadWidget />
      </div>
    </div>
  );
}
