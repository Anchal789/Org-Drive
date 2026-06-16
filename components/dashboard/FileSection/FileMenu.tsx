'use client';

import { useRouter } from 'next/navigation';
import { type FunctionComponent, useState } from 'react';
import AlertModal from '@/components/ui/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { iconsWithPaths } from '@/constants/common-constants';
import { downloadFile, trashFile } from '@/services/file-service';
import type { UploadedFile } from '@/types/files';
import styles from './FileCard.module.scss';

const FileMenu: FunctionComponent<{ file: UploadedFile }> = ({ file }) => {
  const router = useRouter();
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const handleDelete = async () => {
    const response = await trashFile(file.id);
    if (response?.success) {
      router.refresh();
    }
  };
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
        <DropdownMenuContent className="w-40" align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => downloadFile(file.id)}>
              Download
              <DropdownMenuShortcut>
                <Icon d={iconsWithPaths.download} size={14} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Share
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

export default FileMenu;
