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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import RenameItem from '@/components/rename/RenameIterm';
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
import { encrypt } from '@/lib/utils';
import { bookmarkItem, downloadAllFolderFiles } from '@/services/file-service';
import { trashFolder } from '@/services/folder-service';
import { bookmarkSharedItem } from '@/services/shared-with-me-service';
import { useShareDialogStore } from '@/store/store';
import type { UploadedFolder } from '@/types/files';
import styles from '../FolderContainer.module.scss';

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
            <MoreHorizontal size={14} className={styles.moreIcon} />
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
              <PencilLine size={14} className={styles.icon} />
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
              <Download size={14} className={styles.icon} />
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
              <Share size={14} className={styles.icon} />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleBookmark();
              }}
              className={styles.menuItem}
            >
              <Tag size={14} className={styles.icon} />
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
              {folder.shareId ? (
                <UserMinus size={14} className={styles.icon} />
              ) : (
                <Trash2 size={14} className={styles.icon} />
              )}
              {folder.shareId ? 'Remove for me' : 'Delete'}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default FolderMenu;
