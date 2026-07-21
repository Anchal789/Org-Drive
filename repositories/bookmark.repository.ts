import { and, count, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import {
  sharedItemsTable,
  uploadedFilesTable,
  uploadFoldersTable,
  userTable,
} from '@/db/schema';

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
      .from(uploadedFilesTable)
      .leftJoin(userTable, eq(uploadedFilesTable.userId, userTable.id))
      .where(
        and(eq(uploadedFilesTable.userId, userId), eq(uploadedFilesTable.bookmark, true)),
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
    actorId: number,
  ) {
    if (shared) {
      return await db
        .update(sharedItemsTable)
        .set({ bookmark })
        .where(
          and(
            eq(sharedItemsTable.id, id),
            eq(sharedItemsTable.sharedWithUserId, actorId),
          ),
        );
    }
    if (isFile) {
      return await db
        .update(uploadedFilesTable)
        .set({ bookmark: bookmark })
        .where(and(eq(uploadedFilesTable.id, id), eq(uploadedFilesTable.userId, actorId)));
    }
    return await db
      .update(uploadFoldersTable)
      .set({ bookmark })
      .where(
        and(
          eq(uploadFoldersTable.id, id),
          eq(uploadFoldersTable.userId, actorId),
        ),
      );
  },
  async bookmarkMultipleItems(
    items: { id: number; isFile: boolean; shared: boolean }[],
    bookmarkState: boolean,
    actorId: number,
  ) {
    const sharedIds: number[] = [];
    const fileIds: number[] = [];
    const folderIds: number[] = [];

    for (const item of items) {
      if (item.shared) {
        sharedIds.push(item.id);
      } else if (item.isFile) {
        fileIds.push(item.id);
      } else {
        folderIds.push(item.id);
      }
    }

    const promises = [];

    if (sharedIds.length > 0) {
      promises.push(
        await db
          .update(sharedItemsTable)
          .set({ bookmark: bookmarkState })
          .where(
            and(
              inArray(sharedItemsTable.id, sharedIds),
              eq(sharedItemsTable.sharedWithUserId, actorId),
            ),
          ),
      );
    }

    if (fileIds.length > 0) {
      promises.push(
        await db
          .update(uploadedFilesTable)
          .set({ bookmark: bookmarkState })
          .where(
            and(
              inArray(uploadedFilesTable.id, fileIds),
              eq(uploadedFilesTable.userId, actorId),
            ),
          ),
      );
    }

    if (folderIds.length > 0) {
      promises.push(
        await db
          .update(uploadFoldersTable)
          .set({ bookmark: bookmarkState })
          .where(
            and(
              inArray(uploadFoldersTable.id, folderIds),
              eq(uploadFoldersTable.userId, actorId),
            ),
          ),
      );
    }

    return await Promise.all(promises);
  },
  async getBookmarksCount(userId: number) {
    const [bookmarkCount] = await db
      .select({
        count: count(uploadedFilesTable.id),
      })
      .from(uploadedFilesTable)
      .where(
        and(eq(uploadedFilesTable.userId, userId), eq(uploadedFilesTable.bookmark, true)),
      );
    return bookmarkCount.count;
  },
};
