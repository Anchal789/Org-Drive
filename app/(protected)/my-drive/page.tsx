import DriveDropOverlay from '@/components/dashboard/DriveDropOverlay';
import DashGridWrapper from '@/components/dashboard/GridSection/DashGridWrapper';
import SwitchLayout from '@/components/dashboard/SwitchLayout';
import UploadWidget from '@/components/dashboard/UploadWidget';
import { getSessionUser } from '@/lib/session';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.respository';
import { uploadedFoldersRepository } from '@/repositories/uploaded-folders.respository';
import type { UploadedFile, UploadedFolder } from '@/types/files';

export default async function Page() {
  const user = await getSessionUser();
  const files = (await uploadedFilesRepository.getFiles(
    Number(user?.userId),
  )) as Array<UploadedFile>;
  const folders = (await uploadedFoldersRepository.getFolders(
    Number(user?.userId),
  )) as Array<UploadedFolder>;

  return (
    <DashGridWrapper overlay={<DriveDropOverlay />}>
      <SwitchLayout user={user} files={files} folders={folders} />
      <UploadWidget />
    </DashGridWrapper>
  );
}
