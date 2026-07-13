export const dynamic = 'force-dynamic';

import DashFolder from '@/components/dashboard/FolderSection/DashFolder';
import { decrypt } from '@/lib/utils';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.respository';
import { uploadedFoldersRepository } from '@/repositories/uploaded-folders.respository';
import type { UploadedFile } from '@/types/files';

export default async function FolderPage({
  searchParams,
}: {
  searchParams: { folderId: string; folderName: string };
}) {
  const { folderId, folderName } = await searchParams;
  const decryptedId = decrypt(folderId);

  const filesInFolders = (await uploadedFilesRepository.getFilesInFolder(
    Number(decryptedId),
  )) as Array<UploadedFile>;

  const sharedFolder =
    await uploadedFoldersRepository.getCountOfFolderSharedWith(
      Number(decryptedId),
    );

  const permissions = sharedFolder.map((folder) => folder.permission);
  const folderDetails = await uploadedFoldersRepository.getFolderById(
    Number(decryptedId),
  );

  return (
    <DashFolder
      files={filesInFolders}
      folderName={folderName}
      folderId={Number(decryptedId)}
      membersCount={sharedFolder.length}
      permissions={permissions}
      folderDetails={folderDetails}
    />
  );
}
