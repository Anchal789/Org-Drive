"use client";

import { SharedWithMeItemsType } from "@/types/share-with-me";
import { FunctionComponent, useState } from "react";
import styles from "./ShareWithMePage.module.scss";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import Icon from "../ui/icon";
import { iconsWithPaths } from "@/constants/common-constants";
import { downloadFile } from "@/services/file-service";
import AlertModal from "../ui/alert-modal";
import { useRouter } from "next/navigation";
import { trashSharedFile } from "@/services/shared-with-me-service";
import RenameItem from "../rename/RenameIterm";

const ShareWithMeActionColumn: FunctionComponent<{
  props: SharedWithMeItemsType;
}> = ({ props }) => {
  const router = useRouter();
  const [renameOpen, setRenameOpen] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const handleDelete = async () => {
    const response = await trashSharedFile(props.id);
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
        title="Delete file?"
        description={`Are you sure you want to delete "${props.fileName}"?`}
        confirmText="Delete"
        confirmVariant="destructive"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setOpenDeleteDialog(false)}
      />
      {renameOpen && (
        <RenameItem
          file={
            props.fileId
              ? {
                  ...props,
                  id: props.fileId,
                  name: props.fileName,
                  shareId: props.id,
                }
              : undefined
          }
          folder={
            props.folderId
              ? {
                  ...props,
                  id: props.folderId,
                  name: props.folderName,
                  shareId: props.id,
                }
              : undefined
          }
          renameOpen={renameOpen}
          setRenameOpen={setRenameOpen}
        />
      )}
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
        <DropdownMenuContent className="w-40" align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => downloadFile(props.fileId, props.userId)}
            >
              Download
              <DropdownMenuShortcut>
                <Icon d={iconsWithPaths.download} size={14} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
              Rename
              <DropdownMenuShortcut>
                <Icon d={iconsWithPaths.share} size={14} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpenDeleteDialog(true)}>
              Delete
              <DropdownMenuShortcut>
                <Icon d={iconsWithPaths.trash} size={14} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ShareWithMeActionColumn;
