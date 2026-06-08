import Btn from "@/components/ui/Btn";
import Icon from "@/components/ui/Icon";
import DriveCrumb from "./DriveCrumb";
import DriveTopbar from "./DriveTopbar";
import FileCard from "./FileCard";
import UploadWidget from "./UploadWidget";
import { iconsWithPaths } from "@/constants/common-constants";
import { DRIVE_FILES } from "@/constants/dashboard-constants";
import styles from "@/styles/components/DashFolder.module.scss";

type DashFolderProps = {
  folderName?: string;
};

export default function DashFolder({
  folderName = "Engineering",
}: DashFolderProps) {
  return (
    <div className={styles.shell} data-screen-label="02 Drive · Inside folder">
      <div className={styles.main}>
        <DriveTopbar />
        <DriveCrumb inFolder={folderName} />

        <div className={styles.subHeader}>
          <Icon d={iconsWithPaths.users} size={13} /> Shared with 4 people
          <span className={styles.divider} />
          <Icon d={iconsWithPaths.shield} size={13} /> Members can edit
          <div className={styles.flex} />
          <Btn variant="ghost" size="sm" icon={iconsWithPaths.share}>
            Share
          </Btn>
          <Btn variant="outline" size="sm" icon={iconsWithPaths.download}>
            Download all
          </Btn>
        </div>

        <div className={styles.content}>
          {/* Flat folder hint */}
          <div className={styles.flatHint}>
            <Icon
              d={iconsWithPaths.folder}
              size={14}
              style={{ color: "var(--primary)" }}
            />
            <span className={styles.flatHintText}>
              <strong>Flat folder.</strong> Org Drive keeps things simple —
              folders contain files, not other folders. Use tags for finer
              organization.
            </span>
            <span className={styles.flatHintAction}>About this</span>
          </div>

          {/* Files grid */}
          <div className={styles.filesGrid}>
            {DRIVE_FILES.slice(0, 10).map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </div>

        <UploadWidget />
      </div>
    </div>
  );
}
