'use client';

import { Download, Folder, Share, Sparkle, Tag, Trash2, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import AlertModal from '@/components/ui/alert-modal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { handleBookmarMultiple, handleDeleteMultiple } from '@/helpers/file-fn';
import { downloadMultiple } from '@/services/file-service';
import { useSelectedFilesStore, useShareDialogStore } from '@/store/store';
import type { UploadedFile, UploadedFolder } from '@/types/files';
import MoveModal from '../ListSection/MoveModal';
import styles from './FileSelectionBar.module.scss';

export default function FileSelectionBar({
  files,
  folders,
}: {
  files: Array<UploadedFile>;
  folders?: Array<UploadedFolder>;
}) {
  const { selectedFiles, setSelectedFiles, clearSelection, fileCount } =
    useSelectedFilesStore();
  const { setOpen, setFiles, setFile } = useShareDialogStore();

  const [modalState, setModalState] = useState<{
    open: boolean;
    file: Array<UploadedFile> | null;
    action: 'share' | 'move' | 'bookmark' | 'delete' | null;
  }>({
    open: false,
    file: null,
    action: null,
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const router = useRouter();

  const pathName = usePathname();

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
        open={modalState.open && modalState.action === 'move'}
        onOpenChange={(open) => {
          if (!open) {
            setModalState({ open: false, file: null, action: null });
          }
        }}
        modal
      >
        {modalState.open && modalState.action === 'move' && (
          <MoveModal files={modalState.file || []} closeModal={closeModal} />
        )}
      </Dialog>
      <AlertModal
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title='Delete file?'
        description={`Are you sure you want to delete ${selectedFiles.length} items?`}
        confirmText='Delete'
        confirmVariant='destructive'
        cancelText='Cancel'
        onConfirm={() =>
          handleDeleteMultiple({
            selectedFileObjects: selectedFiles,
            router,
            handleCloseAlertDialog,
            pathName,
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

          <Button
            type='button'
            aria-label='Clear selection'
            onClick={clearSelection}
            className={styles.clearBtn}
          >
            <X size={14} strokeWidth={1.6} />
          </Button>

          <div className={styles.spacer} />

          <Button
            className={styles.actionButton}
            onClick={() => {
              downloadMultiple(selectedFiles);
            }}
          >
            <Download size={14} />{' '}
            <span className={styles.btnText}>Download</span>
          </Button>

          <Button
            className={styles.actionButton}
            onClick={() => {
              selectedFiles.length > 1
                ? setFiles(selectedFiles)
                : setFile(selectedFiles[0]);
              useShareDialogStore.setState({ onSuccess: clearSelection });
              setOpen(true);
            }}
          >
            <Share size={14} /> <span className={styles.btnText}>Share</span>
          </Button>
          <Button
            className={styles.actionButton}
            onClick={() =>
              setModalState({
                open: true,
                file: selectedFiles,
                action: 'move',
              })
            }
            disabled={folders?.length === 0}
          >
            <Folder size={14} /> <span className={styles.btnText}>Move</span>
          </Button>
          <Button
            className={styles.actionButton}
            onClick={() => {
              handleBookmarMultiple({
                selectedFileObjects: selectedFiles,
                router,
                clearSelection,
                pathName,
              });
            }}
          >
            <Tag size={14} /> <span className={styles.btnText}>Bookmark</span>
          </Button>
          <Separator orientation='vertical' className={styles.divider} />

          <Button className={styles.actionButton}>
            <Sparkle size={14} /> <span className={styles.btnText}>Ask AI</span>
          </Button>

          <Separator orientation='vertical' className={styles.divider} />

          <Button
            className={`${styles.actionButton} ${styles['actionButton-destructive']}`}
            variant={'destructive'}
            onClick={() => {
              setOpenDeleteDialog(true);
            }}
          >
            <Trash2 size={14} /> <span className={styles.btnText}>Delete</span>
          </Button>
        </div>
      </div>
    </>
  );
}
