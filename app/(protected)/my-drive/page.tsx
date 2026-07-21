import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import DriveDropOverlay from '@/components/dashboard/DriveDropOverlay';
import DashGridWrapper from '@/components/dashboard/GridSection/DashGridWrapper';
import SwitchLayout from '@/components/dashboard/SwitchLayout';
import UploadWidget from '@/components/dashboard/upload-widget/UploadWidget';
import NewItemButton from '@/components/sidebar/NewItemButton';
import { getSessionUser } from '@/lib/session';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.repository';
import { uploadedFoldersRepository } from '@/repositories/uploaded-folders.repository';
import type { UploadedFile, UploadedFolder } from '@/types/files';

async function fetchMoreData(type: 'files' | 'folders', offset: number) {
  'use server';
  const currentUser = await getSessionUser();
  const currentUserId = Number(currentUser?.userId);

  if (type === 'files') {
    const nextFiles = (await uploadedFilesRepository.getCombinedFiles(
      currentUserId,
      30,
      offset,
    )) as Array<UploadedFile>;
    return nextFiles;
  }

  if (type === 'folders') {
    const nextFolders = (await uploadedFoldersRepository.getCombinedFolders(
      currentUserId,
      30,
      offset,
    )) as Array<UploadedFolder>;
    return nextFolders;
  }

  return [];
}

export default async function Page() {
  const user = await getSessionUser();
  if (!user?.userId) redirect('/login');
  const userId = Number(user.userId);

  const allFiles = (await uploadedFilesRepository.getCombinedFiles(
    userId,
    30,
    0,
  )) as Array<UploadedFile>;
  const allFolders = (await uploadedFoldersRepository.getCombinedFolders(
    userId,
    30,
    0,
  )) as Array<UploadedFolder>;

  return (
    <>
      <DashGridWrapper
        overlay={
          <Suspense fallback={null}>
            <DriveDropOverlay />
          </Suspense>
        }
      >
        <SwitchLayout
          key={
            JSON.stringify(allFiles.map((f) => f.id)) +
            JSON.stringify(allFolders.map((f) => f.id))
          }
          files={allFiles}
          folders={allFolders}
          fetchMoreData={fetchMoreData}
        />
      </DashGridWrapper>
      <UploadWidget />
      <NewItemButton fromLayout={true} />
    </>
  );
}
