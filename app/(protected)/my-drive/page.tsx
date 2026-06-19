import DriveDropOverlay from "@/components/dashboard/DriveDropOverlay";
import DashGridWrapper from "@/components/dashboard/GridSection/DashGridWrapper";
import SwitchLayout from "@/components/dashboard/SwitchLayout";
import UploadWidget from "@/components/dashboard/UploadWidget";
import { getSessionUser } from "@/lib/session";
import { sharedWithMeRepository } from "@/repositories/shared-with-me.repository";
import { uploadedFilesRepository } from "@/repositories/uploaded-files.respository";
import { uploadedFoldersRepository } from "@/repositories/uploaded-folders.respository";
import type { UploadedFile, UploadedFolder } from "@/types/files";

export default async function Page() {
  const user = await getSessionUser();
  const userId = Number(user?.userId);
  const files = (await uploadedFilesRepository.getFiles(
    userId,
  )) as Array<UploadedFile>;
  const folders = (await uploadedFoldersRepository.getFolders(
    userId,
  )) as Array<UploadedFolder>;

  const sharedItems = await sharedWithMeRepository.getSharedWithMeFiles(userId);

  const sharedFileIds = sharedItems
    .filter((item) => item.fileId !== null)
    .map((item) => item.fileId as number);

  const sharedFolderIds = sharedItems
    .filter((item) => item.folderId !== null)
    .map((item) => item.folderId as number);

  const sharedFiles = (await uploadedFilesRepository.getFilesByIds(
    sharedFileIds,
  )) as Array<UploadedFile>;

  const sharedFolders = (await uploadedFoldersRepository.getFoldersByIds(
    sharedFolderIds,
  )) as Array<UploadedFolder>;

  return (
    <DashGridWrapper overlay={<DriveDropOverlay />}>
      <SwitchLayout
        files={[...files, ...sharedFiles]}
        folders={[...folders, ...sharedFolders]}
      />
      <UploadWidget />
    </DashGridWrapper>
  );
}
