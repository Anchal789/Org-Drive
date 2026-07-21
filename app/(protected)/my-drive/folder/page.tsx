export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import DriveDropOverlay from '@/components/dashboard/DriveDropOverlay';
import DashFolder from '@/components/dashboard/FolderSection/DashFolder';
import DashGridWrapper from '@/components/dashboard/GridSection/DashGridWrapper';
import { getSessionUser } from '@/lib/session';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.repository';
import { uploadedFoldersRepository } from '@/repositories/uploaded-folders.repository';
import type { UploadedFile } from '@/types/files';

export default async function FolderPage({
  searchParams,
}: {
  searchParams: { folderId: string; folderName: string };
}) {
  const { folderId, folderName } = await searchParams;
  const session = await getSessionUser();
  if (!session?.userId) redirect('/login');

  const decryptedId = Number(folderId);

  const accessibleFolder = await uploadedFoldersRepository.getAccessibleFolder(
    Number(session.userId),
    decryptedId,
  );
  if (!accessibleFolder) redirect('/my-drive');

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
    <DashGridWrapper
      overlay={
        <Suspense fallback={null}>
          <DriveDropOverlay />
        </Suspense>
      }
    >
      <DashFolder
        files={filesInFolders}
        folderName={folderName}
        folderId={Number(decryptedId)}
        membersCount={sharedFolder.length}
        permissions={permissions}
        folderDetails={folderDetails}
      />
    </DashGridWrapper>
  );
}
