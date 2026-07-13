'use client';

import { Download, Share } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { Button } from '@/components/ui/button';
import { useIsTab } from '@/hooks/use-mobile';
import { encrypt } from '@/lib/utils';
import { downloadAllFolderFiles } from '@/services/file-service';
import { useShareDialogStore } from '@/store/store';
import type { UploadedFolder } from '@/types/files';
import styles from './DashFolder.module.scss';

export const ActionButtons: FunctionComponent<{
  folderId: number;
  folderName: string;
  folderDetails: UploadedFolder;
}> = ({ folderId, folderName, folderDetails }) => {
  const { setOpen, setFolder } = useShareDialogStore();
  const encryptedId = encrypt(folderId.toString());

  const isTab = useIsTab();
  return (
    <span className={styles.actions}>
      <Button
        variant={isTab ? 'outline' : 'default'}
        size='sm'
        className={styles.btn}
        onClick={() => {
          setOpen(true);
          setFolder(folderDetails);
        }}
      >
        <Share size={13} />
        Share
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={() =>
          downloadAllFolderFiles(encryptedId, folderDetails?.name || folderName)
        }
        className={styles.btn}
      >
        <Download size={14} />
        Download all
      </Button>
    </span>
  );
};
