export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import BookmarkPage from '@/components/bookmark/BookmarkPage';
import { getSessionUser } from '@/lib/session';
import { bookmarkRepository } from '@/repositories/bookmark.repository';
import { sharedWithMeRepository } from '@/repositories/shared-with-me.repository';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.repository';
import { uploadedFoldersRepository } from '@/repositories/uploaded-folders.repository';
import type { UploadedFile, UploadedFolder } from '@/types/files';
import type { SharedWithMeItemsType } from '@/types/share-with-me';

const Bookmark = async () => {
  const user = await getSessionUser();
  if (!user?.userId) redirect('/login');
  const userId = Number(user.userId);

  const bookmarkedFiles = (await bookmarkRepository.getBookmarksFiles(
    userId,
  )) as Array<UploadedFile>;

  const bookmarkedFolders = (await bookmarkRepository.getBookmarksFolders(
    userId,
  )) as UploadedFolder[];

  const sharedItems = (await sharedWithMeRepository.getSharedWithMeFiles(
    userId,
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
    userId,
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
