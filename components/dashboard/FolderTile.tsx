import Icon from "@/components/ui/Icon";
import UserAvatar from "@/components/ui/UserAvatar";
import { iconsWithPaths, TINTS } from "@/constants/common-constants";
import type { DriveFolder } from "@/types/dashboard";
import styles from "@/styles/components/FolderTile.module.scss";

type FolderTileProps = {
  folder: DriveFolder;
  active?: boolean;
};

export default function FolderTile({
  folder,
  active = false,
}: FolderTileProps) {
  const tint = TINTS[folder.tone];

  return (
    <div
      className={`${styles.tile} ${active ? styles.tileActive : ""}`}
      data-slot="folder-tile"
    >
      <div
        className={styles.iconBox}
        style={{ background: tint.bg, color: tint.tx }}
      >
        <Icon
          d={iconsWithPaths.folder}
          size={16}
          fill="currentColor"
          stroke={0}
        />
      </div>
      <div className={styles.body}>
        <div className={styles.name}>{folder.name}</div>
        <div className={styles.count}>{folder.count} files</div>
      </div>
      <UserAvatar initials={folder.owner[0]} tone={folder.owner[1]} size="sm" />
    </div>
  );
}
