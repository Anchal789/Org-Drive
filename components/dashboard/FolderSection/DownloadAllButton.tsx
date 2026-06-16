'use client';

import type { FunctionComponent } from 'react';
import Btn from '@/components/ui/btn';
import { iconsWithPaths } from '@/constants/common-constants';
import { encrypt } from '@/lib/utils';
import { downloadAllFolderFiles } from '@/services/file-service';

export const DownloadAllButton: FunctionComponent<{
  folderId: number;
  folderName: string;
}> = ({ folderId, folderName }) => {
  const encryptedId = encrypt(folderId.toString());
  return (
    <Btn
      variant="outline"
      size="sm"
      icon={iconsWithPaths.download}
      onClick={() => downloadAllFolderFiles(encryptedId, folderName)}
    >
      Download all
    </Btn>
  );
};
