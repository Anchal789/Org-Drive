import { db } from "@/db";
import {
  trashedTable,
  uploadedFilesTable,
  uploadFoldersTable,
} from "@/db/schema";
import { and, eq, inArray, lt, sql } from "drizzle-orm";

export const trashedItemsRepository = {
  async getTrashedItems(userId: number) {
    const trashedItems = await db
      .select()
      .from(trashedTable)
      .where(and(eq(trashedTable.userId, userId)));

    return trashedItems;
  },
  async restoreTrashItem(userId: number, id: number) {
    const [folderOrFile] = await db
      .select()
      .from(trashedTable)
      .where(and(eq(trashedTable.userId, userId), eq(trashedTable.id, id)));

    if (!folderOrFile) return null;

    if (folderOrFile.fileId) {
      await db
        .update(uploadedFilesTable)
        .set({ isDeleted: false })
        .where(eq(uploadedFilesTable.id, folderOrFile.fileId));

      if (folderOrFile.folderId) {
        await db
          .update(uploadFoldersTable)
          .set({
            fileCount: sql`${uploadFoldersTable.fileCount} + 1`,
          })
          .where(eq(uploadFoldersTable.id, folderOrFile.folderId));
      }
    } else if (folderOrFile.folderId) {
      await db
        .update(uploadFoldersTable)
        .set({ isDeleted: false })
        .where(eq(uploadFoldersTable.id, folderOrFile.folderId));
    }

    const [restoredItem] = await db
      .delete(trashedTable)
      .where(and(eq(trashedTable.userId, userId), eq(trashedTable.id, id)))
      .returning();

    return restoredItem;
  },
  async permanentlyDeleteFile(userId: number, trashId: number) {
    const [trashedItem] = await db
      .select()
      .from(trashedTable)
      .where(
        and(eq(trashedTable.userId, userId), eq(trashedTable.id, trashId)),
      );

    if (!trashedItem || !trashedItem.fileId) return null;
    const [originalFile] = await db
      .select()
      .from(uploadedFilesTable)
      .where(
        and(
          eq(uploadedFilesTable.userId, userId),
          eq(uploadedFilesTable.id, trashedItem.fileId),
        ),
      );

    if (!originalFile) return null;
    await db.delete(trashedTable).where(eq(trashedTable.id, trashId));
    await db
      .delete(uploadedFilesTable)
      .where(eq(uploadedFilesTable.id, originalFile.id));
    return originalFile.telegramMessageId;
  },
  async emptyTrash(userId: number) {
    const trashedItems = await db
      .select()
      .from(trashedTable)
      .where(eq(trashedTable.userId, userId));

    if (trashedItems.length === 0) return [];

    const fileIds = trashedItems
      .filter((t) => t.fileId !== null)
      .map((t) => t.fileId as number);

    const folderIds = trashedItems
      .filter((t) => t.fileId === null && t.folderId !== null)
      .map((t) => t.folderId as number);

    let telegramIdsToRevoke: number[] = [];

    if (fileIds.length > 0) {
      const files = await db
        .select({ telegramMessageId: uploadedFilesTable.telegramMessageId })
        .from(uploadedFilesTable)
        .where(inArray(uploadedFilesTable.id, fileIds));

      telegramIdsToRevoke.push(
        ...files.map((f) => Number(f.telegramMessageId)),
      );
    }
    if (folderIds.length > 0) {
      const filesInFolders = await db
        .select({ telegramMessageId: uploadedFilesTable.telegramMessageId })
        .from(uploadedFilesTable)
        .where(inArray(uploadedFilesTable.folderId, folderIds));

      telegramIdsToRevoke.push(
        ...filesInFolders.map((f) => Number(f.telegramMessageId)),
      );
    }
    await db.delete(trashedTable).where(eq(trashedTable.userId, userId));
    if (fileIds.length > 0) {
      await db
        .delete(uploadedFilesTable)
        .where(inArray(uploadedFilesTable.id, fileIds));
    }

    if (folderIds.length > 0) {
      await db
        .delete(uploadedFilesTable)
        .where(inArray(uploadedFilesTable.folderId, folderIds));
      await db
        .delete(uploadFoldersTable)
        .where(inArray(uploadFoldersTable.id, folderIds));
    }

    return telegramIdsToRevoke.filter((id) => !isNaN(id));
  },
  async getUsersWithExpiredTrash() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const expiredItems = await db
      .select({ userId: trashedTable.userId })
      .from(trashedTable)
      .where(lt(trashedTable.createdAt, thirtyDaysAgo));

    return [...new Set(expiredItems.map((item) => item.userId))];
  },

  async processExpiredTrashForUser(userId: number) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const expiredTrashItems = await db
      .select()
      .from(trashedTable)
      .where(
        and(
          eq(trashedTable.userId, userId),
          lt(trashedTable.createdAt, thirtyDaysAgo),
        ),
      );

    if (expiredTrashItems.length === 0) return [];

    const fileIds = expiredTrashItems
      .filter((t) => t.fileId !== null)
      .map((t) => t.fileId as number);

    const folderIds = expiredTrashItems
      .filter((t) => t.fileId === null && t.folderId !== null)
      .map((t) => t.folderId as number);

    const trashIds = expiredTrashItems.map((t) => t.id);

    let telegramIdsToRevoke: number[] = [];

    if (fileIds.length > 0) {
      const files = await db
        .select({ telegramMessageId: uploadedFilesTable.telegramMessageId })
        .from(uploadedFilesTable)
        .where(inArray(uploadedFilesTable.id, fileIds));

      telegramIdsToRevoke.push(
        ...files.map((f) => Number(f.telegramMessageId)),
      );
    }

    if (folderIds.length > 0) {
      const filesInFolders = await db
        .select({ telegramMessageId: uploadedFilesTable.telegramMessageId })
        .from(uploadedFilesTable)
        .where(inArray(uploadedFilesTable.folderId, folderIds));

      telegramIdsToRevoke.push(
        ...filesInFolders.map((f) => Number(f.telegramMessageId)),
      );
    }

    await db.delete(trashedTable).where(inArray(trashedTable.id, trashIds));

    if (fileIds.length > 0) {
      await db
        .delete(uploadedFilesTable)
        .where(inArray(uploadedFilesTable.id, fileIds));
    }

    if (folderIds.length > 0) {
      await db
        .delete(uploadedFilesTable)
        .where(inArray(uploadedFilesTable.folderId, folderIds));
      await db
        .delete(uploadFoldersTable)
        .where(inArray(uploadFoldersTable.id, folderIds));
    }

    return telegramIdsToRevoke.filter((id) => !isNaN(id));
  },
};
