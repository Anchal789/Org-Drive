"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { X, Download, Share, Folder, Trash2, Tag, Sparkle } from "lucide-react";
import styles from "./FileSelectionBar.module.scss";
import { Separator } from "@/components/ui/separator";
import { useSelectedFilesStore, useShareDialogStore } from "@/store/store";
import { UploadedFile } from "@/types/files";
import { Button } from "@/components/ui/button";
import { downloadMultiple } from "@/services/file-service";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { handleBookmarMultiple, handleDeleteMultiple } from "@/helpers/file-fn";
import { Dialog } from "@/components/ui/dialog";
import MoveModal from "../ListSection/MoveModal";
import AlertModal from "@/components/ui/alert-modal";

export default function FileSelectionBar({
  files,
}: {
  files: Array<UploadedFile>;
}) {
  const { selectedFiles, setSelectedFiles, clearSelection, fileCount } =
    useSelectedFilesStore();
  const { setOpen, setFiles } = useShareDialogStore();

  const [modalState, setModalState] = useState<{
    open: boolean;
    file: Array<UploadedFile> | null;
    action: "share" | "move" | "bookmark" | "delete" | null;
  }>({
    open: false,
    file: null,
    action: null,
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const router = useRouter();

  const selectedCount = selectedFiles.length;
  const isAllSelected = selectedCount === fileCount;

  const closeModal = () => {
    setModalState({ open: false, file: null, action: null });
  };

  const handleCloseAlertDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedFiles([]);
  };

  if (!selectedCount) {
    return null;
  }
  return (
    <>
      <Dialog
        open={modalState.open && modalState.action === "move"}
        onOpenChange={(open) => {
          if (!open) {
            setModalState({ open: false, file: null, action: null });
          }
        }}
        modal
      >
        {modalState.open && modalState.action === "move" && (
          <MoveModal files={modalState.file || []} closeModal={closeModal} />
        )}
      </Dialog>
      <AlertModal
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title="Delete file?"
        description={`Are you sure you want to delete ${selectedFiles.length} items?`}
        confirmText="Delete"
        confirmVariant="destructive"
        cancelText="Cancel"
        onConfirm={() =>
          handleDeleteMultiple({
            selectedFileObjects: selectedFiles,
            router,
            handleCloseAlertDialog,
          })
        }
        onCancel={() => setOpenDeleteDialog(false)}
      />
      <div className={styles.container}>
        <div className={styles.actionBar}>
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={() => {
              if (isAllSelected) {
                clearSelection();
              } else {
                setSelectedFiles(files);
              }
            }}
          />

          {/* Selected Count */}
          <span className={styles.selectedCount}>{selectedCount} selected</span>

          <button
            title="Clear selection"
            onClick={clearSelection}
            className={styles.clearBtn}
          >
            <X size={14} strokeWidth={1.6} />
          </button>

          <div className={styles.spacer} />

          <Button
            className={styles.actionButton}
            onClick={() => {
              downloadMultiple(selectedFiles);
            }}
          >
            <Download size={14} /> Download
          </Button>

          <Button
            className={styles.actionButton}
            onClick={() => {
              setFiles(selectedFiles);
              useShareDialogStore.setState({ onSuccess: clearSelection });
              setOpen(true);
            }}
          >
            <Share size={14} /> Share
          </Button>
          <Button
            className={styles.actionButton}
            onClick={() =>
              setModalState({
                open: true,
                file: selectedFiles,
                action: "move",
              })
            }
          >
            <Folder size={14} /> Move
          </Button>
          <Button
            className={styles.actionButton}
            onClick={() => {
              handleBookmarMultiple({
                selectedFileObjects: selectedFiles,
                router,
                clearSelection,
              });
            }}
          >
            <Tag size={14} /> Bookmark
          </Button>
          <Separator orientation="vertical" />
          <Button className={styles.actionButton}>
            <Sparkle size={14} /> Ask AI
          </Button>

          <Separator orientation="vertical" />
          <Button
            className={`${styles.actionButton} ${styles["actionButton-destructive"]}`}
            variant={"destructive"}
            onClick={() => {
              setOpenDeleteDialog(true);
            }}
          >
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      </div>
    </>
  );
}
