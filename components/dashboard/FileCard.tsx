import FileType from "@/components/ui/FileType";
import Icon from "@/components/ui/Icon";
import UserAvatar from "@/components/ui/UserAvatar";
import Badge from "@/components/ui/Badge";
import { iconsWithPaths, TINTS } from "@/constants/common-constants";
import type { DriveFile } from "@/types/dashboard";
import styles from "@/styles/components/FileCard.module.scss";

type FileCardProps = {
  file: DriveFile;
  big?: boolean;
};

export default function FileCard({ file, big = false }: FileCardProps) {
  return (
    <div
      className={`${styles.card} ${big ? styles.cardBig : ""}`}
      data-slot="file-card"
    >
      <div className={styles.header}>
        <FileType kind={file.kind} />
        <div className={styles.headerActions}>
          {file.starred && (
            <Icon
              d={iconsWithPaths.star}
              size={13}
              style={{
                color: TINTS.amber.bd,
                fill: TINTS.amber.bg,
              }}
            />
          )}
          <Icon
            d={iconsWithPaths.more}
            size={14}
            style={{ color: "var(--muted-foreground)" }}
          />
        </div>
      </div>

      <div className={styles.preview} style={{ height: big ? 88 : 72 }}>
        <Icon
          d={iconsWithPaths.file}
          size={big ? 30 : 24}
          style={{
            color:
              "color-mix(in oklch, var(--muted-foreground) 45%, transparent)",
          }}
        />
      </div>

      <div>
        <div className={styles.name}>{file.name}</div>
        <div className={styles.meta}>
          <div className={styles.metaLeft}>
            <UserAvatar
              initials={file.owner[0]}
              tone={file.owner[1]}
              size="sm"
            />
            <span className={styles.modTime}>{file.mod}</span>
          </div>
          {file.status === "processing" && <Badge tone="amber">Indexing</Badge>}
        </div>
      </div>
    </div>
  );
}
