"use client";

import { SharedWithMeItemsType } from "@/types/share-with-me";
import { FunctionComponent, useState } from "react";
import styles from "./ShareWithMePage.module.scss";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { downloadFile } from "@/services/file-service";
import AlertModal from "../ui/alert-modal";
import { useRouter } from "next/navigation";
import { trashSharedFile } from "@/services/shared-with-me-service";
import RenameItem from "../rename/RenameIterm";
import { Separator } from "../ui/separator";
import { useShareDialogStore } from "@/store/store";
import {
  Download,
  MoreHorizontal,
  PencilLine,
  Share,
  Trash2,
} from "lucide-react";

const ShareWithMeActionColumn: FunctionComponent<{
  props: SharedWithMeItemsType;
}> = ({ props }) => {
  const { setOpen, setFile, setFolder } = useShareDialogStore();
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

  const canEdit = props.permission === "editor";

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
                }
              : undefined
          }
          folder={
            props.folderId
              ? {
                  ...props,
                  id: props.folderId,
                  name: props.folderName,
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
            <MoreHorizontal size={14} className={styles.moreIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="start">
          <DropdownMenuGroup>
            {canEdit && (
              <DropdownMenuItem
                onSelect={() => setRenameOpen(true)}
                className={styles.menuItem}
              >
                <PencilLine size={14} />
                Rename
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => downloadFile(props.fileId, props.userId)}
              className={styles.menuItem}
            >
              <Download size={14} />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setOpen(true);
                const file = props.fileId;
                file ? setFile(props) : setFolder(props);
              }}
              className={styles.menuItem}
            >
              <Share size={14} className={styles.icon} />
              Share
            </DropdownMenuItem>
            <Separator />
            <DropdownMenuItem
              onClick={() => setOpenDeleteDialog(true)}
              className={`${styles.menuItem} ${styles.deleteItem}`}
            >
              <Trash2 size={14} />
              Remove for me
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ShareWithMeActionColumn;
