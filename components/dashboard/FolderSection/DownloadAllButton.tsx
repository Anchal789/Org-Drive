'use client';

import type { FunctionComponent } from 'react';
import { encrypt } from '@/lib/utils';
import { downloadAllFolderFiles } from '@/services/file-service';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export const DownloadAllButton: FunctionComponent<{
  folderId: number;
  folderName: string;
}> = ({ folderId, folderName }) => {
  const encryptedId = encrypt(folderId.toString());
  return (
    <Button
      variant='outline'
      size='sm'
      onClick={() => downloadAllFolderFiles(encryptedId, folderName)}
    >
      <Download size={14} />
      Download all
    </Button>
  );
};
