"use client";

import { useRouter } from "next/navigation";
import type { FunctionComponent } from "react";
import { encrypt, getAvatarColor, getFolderTone } from "@/lib/utils";
import type { UploadedFolder } from "@/types/files";
import styles from "./FolderContainer.module.scss";
import FolderTile from "./FolderTile";
import Icon from "@/components/ui/icon";
import { iconsWithPaths, TINTS } from "@/constants/common-constants";
import FolderMenu from "./FolderMenu/FolderMenu";
import UserAvatar from "@/components/ui/user-avatar";

const FolderContainer: FunctionComponent<{
  folder: UploadedFolder;
  layout?: string;
}> = ({ folder, layout }) => {
  const router = useRouter();
  const folderId = encrypt(folder.id.toString());
  const folderTone = (folder: UploadedFolder) =>
    TINTS?.[getFolderTone(folder.id)];

  const ownerInitials = folder
    ? `${folder.ownerFirstName?.charAt(0) ?? ""}${folder.ownerLastName?.charAt(0) ?? ""}`
    : "";

  if (layout === "grid")
    return (
      <div
        role="button"
        tabIndex={0}
        className={styles.folderContainer}
        onClick={(e) => {
          const target = e.target as HTMLElement;

          if (
            target.closest("button") ||
            target.closest('[role="dialog"]') ||
            target.closest('[data-slot="dialog-content"]')
          ) {
            return;
          }

          router.push(
            `/my-drive/folder?folderId=${folderId}&folderName=${folder.name}`,
          );
        }}
      >
        <FolderTile folder={folder} />
      </div>
    );

  if (layout === "list")
    return (
      <div
        role="button"
        tabIndex={0}
        className={styles.folderContainer}
        onClick={(e) => {
          const target = e.target as HTMLElement;

          if (
            target.closest("button") ||
            target.closest('[role="dialog"]') ||
            target.closest('[data-slot="dialog-content"]')
          ) {
            return;
          }
          router.push(
            `/my-drive/folder?folderId=${folderId}&folderName=${folder.name}`,
          );
        }}
      >
        <div key={folder.name} className={styles.folderChip}>
          <div className={styles.folderInfo}>
            <Icon
              d={iconsWithPaths.folder}
              size={14}
              fill={folderTone(folder)?.bg}
              stroke={0}
            />
            <span className={styles.folderName}>{folder.name}</span>
          </div>
          <div className={styles.folderActions}>
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
        </div>
      </div>
    );
};

export default FolderContainer;
