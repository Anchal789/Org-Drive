'use client';

import { useRouter } from 'next/navigation';
import type { FunctionComponent } from 'react';
import { Button } from '@/components/ui/button';
import { encrypt } from '@/lib/utils';
import type { SessionUser } from '@/types/auth';
import type { UploadedFolder } from '@/types/files';
import styles from './FolderContainer.module.scss';
import FolderTile from './FolderTile';

const FolderContainer: FunctionComponent<{
  folder: UploadedFolder;
  user: SessionUser;
}> = ({ folder, user }) => {
  const router = useRouter();
  const folderId = encrypt(folder.id.toString());

  return (
    <Button
      type="button"
      className={styles.folderContainer}
      onClick={() => {
        router.push(
          `/my-drive/folder?folderId=${folderId}&folderName=${folder.name}`,
        );
      }}
    >
      <FolderTile folder={folder} user={user} />
    </Button>
  );
};

export default FolderContainer;
