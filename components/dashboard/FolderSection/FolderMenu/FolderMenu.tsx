"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AlertModal from "@/components/ui/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Icon from "@/components/ui/icon";
import { iconsWithPaths } from "@/constants/common-constants";
import styles from "../FolderContainer.module.scss";
import { useShareDialogStore } from "@/store/store";
import { UploadedFolder } from "@/types/files";
import { Separator } from "@/components/ui/separator";
import { bookmarkItem, downloadAllFolderFiles } from "@/services/file-service";
import { encrypt } from "@/lib/utils";
import RenameItem from "@/components/rename/RenameIterm";
import { bookmarkSharedItem } from "@/services/shared-with-me-service";
import { trashFolder } from "@/services/folder-service";

const FolderMenu = ({
  folder,
}: {
  folder: UploadedFolder & { shareId?: number };
}) => {
  const { setOpen, setFolder } = useShareDialogStore();
  const router = useRouter();
  const [renameOpen, setRenameOpen] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const handleBookmark = async () => {
    const response = folder.shareId
      ? await bookmarkSharedItem(folder.shareId as number, !folder.bookmark)
      : await bookmarkItem(folder.id, false, !folder.bookmark);
    if (response?.success) {
      router.refresh();
    }
  };

  const handleDelete = async () => {
    const response = await trashFolder(folder.id, folder.shareId);
    if (response?.success) {
      router.refresh();
      setOpenDeleteDialog(false);
    }
  };
  return (
    <>
      <AlertModal
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title="Delete folder?"
        description={`Are you sure you want to delete "${folder.name}"?`}
        confirmText="Delete"
        confirmVariant="destructive"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setOpenDeleteDialog(false)}
      />
      <RenameItem
        file={undefined}
        folder={folder}
        renameOpen={renameOpen}
        setRenameOpen={setRenameOpen}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            className={styles.moreBtn}
            onClick={(e) => e.stopPropagation()}
          >
            <Icon
              d={iconsWithPaths.more}
              size={14}
              className={styles.moreIcon}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={styles.menuContent} align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setRenameOpen(true);
              }}
              className={styles.menuItem}
            >
              <Icon
                d={iconsWithPaths.pencil}
                size={14}
                className={styles.icon}
              />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                const encryptedId = encrypt(folder.id.toString());
                downloadAllFolderFiles(encryptedId, folder.name);
              }}
              className={styles.menuItem}
            >
              <Icon
                d={iconsWithPaths.download}
                size={14}
                className={styles.icon}
              />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
                setFolder(folder);
              }}
              className={styles.menuItem}
            >
              <Icon
                d={iconsWithPaths.share}
                size={14}
                className={styles.icon}
              />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleBookmark();
              }}
              className={styles.menuItem}
            >
              <Icon
                d={iconsWithPaths.bookmark}
                size={14}
                className={styles.icon}
              />
              Bookmark
            </DropdownMenuItem>
            <Separator className={styles.separator} />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setOpenDeleteDialog(true);
              }}
              className={`${styles.menuItem} ${styles.deleteItem}`}
            >
              <Icon
                d={
                  folder.shareId
                    ? iconsWithPaths.userRemove
                    : iconsWithPaths.trash
                }
                size={14}
                className={styles.icon}
              />
              {folder.shareId ? "Remove for me" : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default FolderMenu;
