import BookmarkPage from "@/components/bookmark/BookmarkPage";
import { getSessionUser } from "@/lib/session";
import { bookmarkRepository } from "@/repositories/bookmark.repository";
import { sharedWithMeRepository } from "@/repositories/shared-with-me.repository";
import { uploadedFilesRepository } from "@/repositories/uploaded-files.respository";
import { uploadedFoldersRepository } from "@/repositories/uploaded-folders.respository";
import { UploadedFile, UploadedFolder } from "@/types/files";
import { SharedWithMeItemsType } from "@/types/share-with-me";

const Bookmark = async () => {
  const user = await getSessionUser();
  const bookmarkedFiles = (await bookmarkRepository.getBookmarksFiles(
    Number(user?.userId),
  )) as Array<UploadedFile>;

  const bookmarkedFolders = (await bookmarkRepository.getBookmarksFolders(
    Number(user?.userId),
  )) as UploadedFolder[];

  const sharedItems = (await sharedWithMeRepository.getSharedWithMeFiles(
    Number(user?.userId),
  )) as Array<SharedWithMeItemsType>;

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
    Number(user?.userId),
  )) as Array<UploadedFolder>;

  bookmarkedFiles.push(...sharedFiles);
  bookmarkedFolders.push(...sharedFolders);

  const uniqueFiles = Array.from(
    new Map(
      [...bookmarkedFiles, ...sharedFiles].map((file) => [file.id, file]),
    ).values(),
  ).filter((file) => file.bookmark);

  const uniqueFolders = Array.from(
    new Map(
      [...bookmarkedFolders, ...sharedFolders].map((folder) => [
        folder.id,
        folder,
      ]),
    ).values(),
  ).filter((folder) => folder.bookmark);

  return (
    <BookmarkPage
      bookmarkedFiles={uniqueFiles}
      bookmarkedFolders={uniqueFolders}
    />
  );
};

export default Bookmark;
