"use client";

import { TrashInterface } from "@/types/trash";
import { FunctionComponent, useState } from "react";
import styles from "./TrashPage.module.scss";
import { Button } from "../ui/button";
import AlertModal from "../ui/alert-modal";
import { useRouter } from "next/navigation";
import { permanentDeleteFile, restoreFile } from "@/services/trash-service";
import CustomTooltip from "../ui/custom-tooltip";
import { RefreshCw, X } from "lucide-react";

const TrashTableActionColumn: FunctionComponent<{
  trashed: TrashInterface;
}> = ({ trashed }) => {
  const router = useRouter();
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    action: "delete" | "restore" | null;
  }>({
    open: false,
    action: "delete",
  });

  const handleRestore = async () => {
    const response = await restoreFile(trashed.id);
    if (response?.success) {
      router.refresh();
      closeDialog();
    }
  };

  const handleDelete = async () => {
    const response = await permanentDeleteFile(trashed.id);
    if (response?.success) {
      router.refresh();
      closeDialog();
    }
  };

  const closeDialog = () => {
    setDialogState({
      open: false,
      action: null,
    });
  };

  return (
    <>
      <AlertModal
        open={dialogState.open}
        onOpenChange={closeDialog}
        title="Delete file?"
        description={
          dialogState.action === "delete"
            ? `Are you sure you want to delete this ${trashed.folderId ? "folder" : "file"}?`
            : `Are you sure you want to restore this ${trashed.folderId ? "folder" : "file"}?`
        }
        confirmText="Delete"
        confirmVariant="destructive"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={closeDialog}
      />
      <div className={styles.actions}>
        <CustomTooltip title="Restore">
          <Button
            type="button"
            onClick={handleRestore}
            className={styles.iconButton}
          >
            <RefreshCw size={14} className={styles.icon} />
          </Button>
        </CustomTooltip>
        <CustomTooltip title="Delete Permanently">
          <Button
            type="button"
            onClick={() => {
              setDialogState({
                open: true,
                action: "delete",
              });
            }}
            className={styles.iconButton}
          >
            <X size={14} className={styles.icon} />
          </Button>
        </CustomTooltip>
      </div>
    </>
  );
};

export default TrashTableActionColumn;
