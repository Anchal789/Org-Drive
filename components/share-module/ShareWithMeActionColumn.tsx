'use client';

import {
  Download,
  MoreHorizontal,
  PencilLine,
  Share,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FunctionComponent, useState } from 'react';
import { downloadFile } from '@/services/file-service';
import { trashSharedFile } from '@/services/shared-with-me-service';
import { useShareDialogStore } from '@/store/store';
import type { UploadedFile, UploadedFolder } from '@/types/files';
import type { SharedWithMeItemsType } from '@/types/share-with-me';
import RenameItem from '../rename/RenameIterm';
import AlertModal from '../ui/alert-modal';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Separator } from '../ui/separator';
import styles from './ShareWithMePage.module.scss';

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

  const canEdit = props.permission === 'editor';

  const targetFile = props.fileId
    ? ({
        ...props,
        id: props.fileId,
        name: props.fileName,
        telegramMessageId: 0,
        documentId: '',
        accessHash: '',
        size: 0,
        type: '',
        isDeleted: false,
        updatedAt: props.createdAt,
        shareId: props.id,
        mimeType: 'pdf',
      } as UploadedFile & { shareId?: number })
    : undefined;

  const targetFolder = props.folderId
    ? ({
        ...props,
        id: props.folderId,
        name: props.folderName,
        fileCount: 0,
        isDeleted: false,
        updatedAt: props.createdAt,
      } as UploadedFolder)
    : undefined;

  return (
    <>
      <AlertModal
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title="Delete file?"
        description={`Are you sure you want to delete "${props.fileName || props.folderName}"?`}
        confirmText="Delete"
        confirmVariant="destructive"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setOpenDeleteDialog(false)}
      />

      {renameOpen && (
        <RenameItem
          file={targetFile}
          folder={targetFolder}
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

            {props.fileId && (
              <DropdownMenuItem
                onClick={() => {
                  const fileId = props.fileId;
                  if (fileId) downloadFile(fileId, props.userId);
                }}
                className={styles.menuItem}
              >
                <Download size={14} />
                Download
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => {
                setOpen(true);
                // 3. Pass the strictly typed payloads to the store
                if (targetFile) setFile(targetFile);
                else if (targetFolder) setFolder(targetFolder);
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
