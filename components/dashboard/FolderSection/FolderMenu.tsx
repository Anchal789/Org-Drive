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
import styles from "./FolderContainer.module.scss";
import { useShareDialogStore } from "@/store/store";
import { UploadedFolder } from "@/types/files";
import { Separator } from "@/components/ui/separator";
import { bookmarkItem } from "@/services/file-service";

const FolderMenu = ({ folder }: { folder: UploadedFolder }) => {
  const { setOpen, setFolder } = useShareDialogStore();
  const router = useRouter();
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const handleBookmark = async () => {
    const response = await bookmarkItem(folder.id, false, !folder.bookmark);
    if (response?.success) {
      router.refresh();
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
        // onConfirm={handleDelete}
        onCancel={() => setOpenDeleteDialog(false)}
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
                downloadFolder(folder.id);
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
                d={iconsWithPaths.trash}
                size={14}
                className={styles.icon}
              />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default FolderMenu;
