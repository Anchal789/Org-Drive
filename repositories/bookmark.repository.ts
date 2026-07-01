import { and, count, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import {
  sharedItemsTable,
  uploadedFilesTable,
  uploadFoldersTable,
  userTable,
} from '@/db/schema';
import { uploadedFiles } from '@/drizzle/schema';

export const bookmarkRepository = {
  async getBookmarksFiles(userId: number) {
    const files = await db
      .select({
        id: uploadedFilesTable.id,
        userId: uploadedFilesTable.userId,
        telegramMessageId: uploadedFilesTable.telegramMessageId,
        documentId: uploadedFilesTable.documentId,
        accessHash: uploadedFilesTable.accessHash,
        name: uploadedFilesTable.name,
        size: uploadedFilesTable.size,
        mimeType: uploadedFilesTable.mimeType,
        createdAt: uploadedFilesTable.createdAt,
        updatedAt: uploadedFilesTable.updatedAt,
        isDeleted: uploadedFilesTable.isDeleted,
        bookmark: uploadedFilesTable.bookmark,
        folderId: uploadedFilesTable.folderId,
        ownerFirstName: userTable.firstName,
        ownerLastName: userTable.lastName,
      })
      .from(uploadedFiles)
      .leftJoin(userTable, eq(uploadedFilesTable.userId, userTable.id))
      .where(
        and(eq(uploadedFiles.userId, userId), eq(uploadedFiles.bookmark, true)),
      );
    return files;
  },
  async getBookmarksFolders(userId: number) {
    return await db
      .select({
        id: uploadFoldersTable.id,
        userId: uploadFoldersTable.userId,
        name: uploadFoldersTable.name,
        fileCount: uploadFoldersTable.fileCount,
        isDeleted: uploadFoldersTable.isDeleted,
        createdAt: uploadFoldersTable.createdAt,
        updatedAt: uploadFoldersTable.updatedAt,
        bookmark: uploadFoldersTable.bookmark,
        ownerFirstName: userTable.firstName,
        ownerLastName: userTable.lastName,
      })
      .from(uploadFoldersTable)
      .leftJoin(userTable, eq(uploadFoldersTable.userId, userTable.id))
      .where(
        and(
          eq(uploadFoldersTable.userId, userId),
          eq(uploadFoldersTable.bookmark, true),
        ),
      );
  },
  async bookmarkItem(
    id: number,
    isFile: boolean,
    bookmark: boolean,
    shared: boolean,
  ) {
    if (shared) {
      return await db
        .update(sharedItemsTable)
        .set({ bookmark })
        .where(eq(sharedItemsTable.id, id));
    }
    if (isFile) {
      return await db
        .update(uploadedFiles)
        .set({ bookmark: bookmark })
        .where(eq(uploadedFiles.id, id));
    }
    return await db
      .update(uploadFoldersTable)
      .set({ bookmark })
      .where(eq(uploadFoldersTable.id, id));
  },
  async bookmarkMultipleItems(
    items: { id: number; isFile: boolean; shared: boolean }[],
    bookmarkState: boolean,
  ) {
    const sharedIds = items.filter((i) => i.shared).map((i) => i.id);
    const fileIds = items.filter((i) => !i.shared && i.isFile).map((i) => i.id);
    const folderIds = items
      .filter((i) => !i.shared && !i.isFile)
      .map((i) => i.id);

    const promises = [];

    if (sharedIds.length > 0) {
      return promises.push(
        await db
          .update(sharedItemsTable)
          .set({ bookmark: bookmarkState })
          .where(inArray(sharedItemsTable.id, sharedIds)),
      );
    }

    if (fileIds.length > 0) {
      promises.push(
        await db
          .update(uploadedFiles)
          .set({ bookmark: bookmarkState })
          .where(inArray(uploadedFiles.id, fileIds)),
      );
    }

    if (folderIds.length > 0) {
      promises.push(
        await db
          .update(uploadFoldersTable)
          .set({ bookmark: bookmarkState })
          .where(inArray(uploadFoldersTable.id, folderIds)),
      );
    }

    return await Promise.all(promises);
  },
  async getBookmarksCount(userId: number) {
    const [bookmarkCount] = await db
      .select({
        count: count(uploadedFilesTable.id),
      })
      .from(uploadedFiles)
      .where(
        and(eq(uploadedFiles.userId, userId), eq(uploadedFiles.bookmark, true)),
      );
    return bookmarkCount.count;
  },
};
