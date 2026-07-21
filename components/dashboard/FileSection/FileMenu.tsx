'use client';

import {
  Download,
  MoreHorizontal,
  PencilLine,
  Share,
  Tag,
  Trash2,
  UserMinus,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { type FunctionComponent, useState } from 'react';
import RenameItem from '@/components/rename/RenameItem';
import AlertModal from '@/components/ui/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { bookmarkItem, downloadFile, trashFile } from '@/services/file-service';
import { bookmarkSharedItem } from '@/services/shared-with-me-service';
import { useShareDialogStore } from '@/store/store';
import type { UploadedFile } from '@/types/files';
import styles from './FileCard.module.scss';

const FileMenu: FunctionComponent<{
  file: UploadedFile & { shareId?: number; permission?: string };
}> = ({ file }) => {
  const { setOpen, setFile } = useShareDialogStore();
  const router = useRouter();
  const [renameOpen, setRenameOpen] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const pathName = usePathname();

  const handleDelete = async () => {
    const response = await trashFile(file.id, file.shareId);
    if (response?.success) {
      router.refresh();
      setOpenDeleteDialog(false);
    }
  };

  const handleBookmark = async () => {
    const response = file.shareId
      ? await bookmarkSharedItem(
          file.shareId as number,
          !file.bookmark,
          pathName,
        )
      : await bookmarkItem(file.id, true, !file.bookmark, pathName);
    if (response?.success) {
      router.refresh();
    }
  };

  const canEdit = file?.permission === 'editor' || !file?.permission;
  return (
    <>
      <AlertModal
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title='Delete file?'
        description={`Are you sure you want to delete "${file.name}"?`}
        confirmText='Delete'
        confirmVariant='destructive'
        cancelText='Cancel'
        onConfirm={handleDelete}
        onCancel={() => setOpenDeleteDialog(false)}
      />
      <RenameItem
        file={file}
        folder={undefined}
        renameOpen={renameOpen}
        setRenameOpen={setRenameOpen}
        pathName={pathName}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild className={styles.dropdownTrigger}>
          <Button
            type='button'
            className={styles.moreBtn}
            aria-label={`More actions for ${file.name}`}
          >
            <MoreHorizontal size={14} className={styles.moreIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={styles.menuContent} align='start'>
          <DropdownMenuGroup>
            {canEdit && (
              <DropdownMenuItem
                onClick={() => setRenameOpen(true)}
                className={styles.menuItem}
              >
                <PencilLine size={14} className={styles.icon} />
                Rename
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => downloadFile(file.id)}
              className={styles.menuItem}
            >
              <Download size={14} className={styles.icon} />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setOpen(true);
                setFile(file);
              }}
              className={styles.menuItem}
            >
              <Share size={14} className={styles.icon} />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                handleBookmark();
              }}
              className={styles.menuItem}
            >
              <Tag size={14} className={styles.icon} />
              {file.bookmark ? 'Unbookmark' : 'Bookmark'}
            </DropdownMenuItem>
            <Separator className={styles.separator} />
            <DropdownMenuItem
              onClick={() => setOpenDeleteDialog(true)}
              className={`${styles.menuItem} ${styles.deleteItem}`}
            >
              {file.shareId ? (
                <UserMinus size={14} className={styles.icon} />
              ) : (
                <Trash2 size={14} className={styles.icon} />
              )}
              {file.shareId ? 'Remove for me' : 'Delete'}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default FileMenu;
