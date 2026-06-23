"use client";

import { useRouter } from "next/navigation";
import type { FunctionComponent } from "react";
import { encrypt, getFolderTone } from "@/lib/utils";
import type { UploadedFolder } from "@/types/files";
import styles from "./FolderContainer.module.scss";
import FolderTile from "./FolderTile";
import Icon from "@/components/ui/icon";
import { iconsWithPaths, TINTS } from "@/constants/common-constants";

const FolderContainer: FunctionComponent<{
  folder: UploadedFolder;
  layout?: string;
}> = ({ folder, layout }) => {
  const router = useRouter();
  const folderId = encrypt(folder.id.toString());
  const folderTone = (folder: UploadedFolder) =>
    TINTS?.[getFolderTone(folder.id)];

  if (layout === "grid")
    return (
      <div
        role="button"
        tabIndex={0}
        className={styles.folderContainer}
        onClick={() => {
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
        onClick={() => {
          router.push(
            `/my-drive/folder?folderId=${folderId}&folderName=${folder.name}`,
          );
        }}
      >
        <div key={folder.name} className={styles.folderChip}>
          <Icon
            d={iconsWithPaths.folder}
            size={14}
            fill={folderTone(folder)?.bg}
            stroke={0}
          />
          <span className={styles.folderName}>{folder.name}</span>
        </div>
      </div>
    );
};

export default FolderContainer;
