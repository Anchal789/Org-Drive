"use client";

import { useRouter } from "next/navigation";
import { type FunctionComponent, useState } from "react";
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
import { bookmarkItem, downloadFile, trashFile } from "@/services/file-service";
import type { UploadedFile } from "@/types/files";
import styles from "./FileCard.module.scss";
import { useShareDialogStore } from "@/store/store";
import { Separator } from "@/components/ui/separator";
import RenameItem from "@/components/rename/RenameIterm";
import { bookmarkSharedItem } from "@/services/shared-with-me-service";

const FileMenu: FunctionComponent<{
  file: UploadedFile & { shareId?: number; permission?: string };
}> = ({ file }) => {
  const { setOpen, setFile } = useShareDialogStore();
  const router = useRouter();
  const [renameOpen, setRenameOpen] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const handleDelete = async () => {
    const response = await trashFile(file.id, file.shareId);
    if (response?.success) {
      router.refresh();
      setOpenDeleteDialog(false);
    }
  };

  const handleBookmark = async () => {
    const response = file.shareId
      ? await bookmarkSharedItem(file.shareId as number, !file.bookmark)
      : await bookmarkItem(file.id, true, !file.bookmark);
    if (response?.success) {
      router.refresh();
    }
  };

  const canEdit = file?.permission === "editor" || !file?.permission;
  return (
    <>
      <AlertModal
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title="Delete file?"
        description={`Are you sure you want to delete "${file.name}"?`}
        confirmText="Delete"
        confirmVariant="destructive"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setOpenDeleteDialog(false)}
      />
      <RenameItem
        file={file}
        folder={undefined}
        renameOpen={renameOpen}
        setRenameOpen={setRenameOpen}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" className={styles.moreBtn}>
            <Icon
              d={iconsWithPaths.more}
              size={14}
              className={styles.moreIcon}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={styles.menuContent} align="start">
          <DropdownMenuGroup>
            {canEdit && (
              <DropdownMenuItem
                onClick={() => setRenameOpen(true)}
                className={styles.menuItem}
              >
                <Icon
                  d={iconsWithPaths.pencil}
                  size={14}
                  className={styles.icon}
                />
                Rename
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => downloadFile(file.id)}
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
              onClick={() => {
                setOpen(true);
                setFile(file);
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
              onClick={() => {
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
              onClick={() => setOpenDeleteDialog(true)}
              className={`${styles.menuItem} ${styles.deleteItem}`}
            >
              <Icon
                d={
                  file.shareId
                    ? iconsWithPaths.userRemove
                    : iconsWithPaths.trash
                }
                size={14}
                className={styles.icon}
              />
              {file.shareId ? "Remove for me" : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default FileMenu;
