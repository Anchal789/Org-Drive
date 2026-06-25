import Icon from "@/components/ui/icon";
import UserAvatar from "@/components/ui/user-avatar";
import { iconsWithPaths, TINTS } from "@/constants/common-constants";
import { getAvatarColor, getFolderTone } from "@/lib/utils";
import type { UploadedFolder } from "@/types/files";
import styles from "./FolderTile.module.scss";
import FolderMenu from "./FolderMenu/FolderMenu";

export default function FolderTile({
  folder,
  active = false,
}: {
  folder: UploadedFolder;
  active?: boolean;
}) {
  const tint = TINTS[getFolderTone(folder.id)];
  const ownerInitials = folder
    ? `${folder.ownerFirstName?.charAt(0) ?? ""}${folder.ownerLastName?.charAt(0) ?? ""}`
    : "";

  return (
    <div
      className={`${styles.tile} ${active ? styles.tileActive : ""}`}
      data-slot="folder-tile"
    >
      <div
        className={styles.iconBox}
        style={{ background: tint?.bg, color: tint?.tx }}
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
        <div className={styles.count}>{folder.fileCount} files</div>
      </div>
      {folder.bookmark && (
        <Icon
          d={iconsWithPaths.bookmark}
          size={13}
          className={styles.starIcon}
        />
      )}
      <UserAvatar
        initials={ownerInitials}
        tone={getAvatarColor(folder?.userId ?? "")}
        size="sm"
      />
      <FolderMenu folder={folder} />
    </div>
  );
}
