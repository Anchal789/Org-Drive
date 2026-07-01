import { db } from "@/db";
import {
  trashedTable,
  uploadedFilesTable,
  uploadFoldersTable,
} from "@/db/schema";
import {
  and,
  eq,
  inArray,
  lt,
  sql,
  isNull,
  not,
  isNotNull,
  exists,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export const trashedItemsRepository = {
  async getTrashedItems(userId: number) {
    const folderRow = alias(trashedTable, "folder_row");
    const hiddenChildFile = and(
      isNotNull(trashedTable.fileId),
      isNotNull(trashedTable.folderId),
      exists(
        db
          .select({ one: sql`1` })
          .from(folderRow)
          .where(
            and(
              eq(folderRow.userId, userId),
              eq(folderRow.folderId, trashedTable.folderId),
              isNull(folderRow.fileId),
            ),
          ),
      ),
    )!;
    const trashedItems = await db
      .select()
      .from(trashedTable)
      .where(and(eq(trashedTable.userId, userId), not(hiddenChildFile)));

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
          .set({ fileCount: sql`${uploadFoldersTable.fileCount} + 1` })
          .where(eq(uploadFoldersTable.id, folderOrFile.folderId));
      }
      await db
        .delete(trashedTable)
        .where(and(eq(trashedTable.userId, userId), eq(trashedTable.id, id)));

      return folderOrFile;
    }
    if (folderOrFile.folderId) {
      const folderId = folderOrFile.folderId;
      await db
        .update(uploadFoldersTable)
        .set({ isDeleted: false })
        .where(eq(uploadFoldersTable.id, folderId));
      await db
        .update(uploadedFilesTable)
        .set({ isDeleted: false })
        .where(
          and(
            eq(uploadedFilesTable.userId, userId),
            eq(uploadedFilesTable.folderId, folderId),
          ),
        );

      await db
        .delete(trashedTable)
        .where(
          and(
            eq(trashedTable.userId, userId),
            eq(trashedTable.folderId, folderId),
          ),
        );

      return folderOrFile;
    }
    return null;
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
  async permanentlyDeleteItem(userId: number, trashId: number) {
    const [trashedItem] = await db
      .select()
      .from(trashedTable)
      .where(
        and(eq(trashedTable.userId, userId), eq(trashedTable.id, trashId)),
      );
    if (!trashedItem) return null;
    let telegramIdsToRevoke: number[] = [];
    if (trashedItem.fileId) {
      const [originalFile] = await db
        .select({ telegramMessageId: uploadedFilesTable.telegramMessageId })
        .from(uploadedFilesTable)
        .where(
          and(
            eq(uploadedFilesTable.userId, userId),
            eq(uploadedFilesTable.id, trashedItem.fileId),
          ),
        );

      if (originalFile) {
        telegramIdsToRevoke.push(Number(originalFile.telegramMessageId));
      }
      await db.delete(trashedTable).where(eq(trashedTable.id, trashId));
      await db
        .delete(uploadedFilesTable)
        .where(eq(uploadedFilesTable.id, trashedItem.fileId));
    } else if (trashedItem.folderId) {
      const filesInFolder = await db
        .select({
          id: uploadedFilesTable.id,
          telegramMessageId: uploadedFilesTable.telegramMessageId,
        })
        .from(uploadedFilesTable)
        .where(eq(uploadedFilesTable.folderId, trashedItem.folderId));
      telegramIdsToRevoke.push(
        ...filesInFolder.map((f) => Number(f.telegramMessageId)),
      );
      await db.delete(trashedTable).where(eq(trashedTable.id, trashId));
      await db
        .delete(trashedTable)
        .where(eq(trashedTable.id, trashedItem.folderId));
      await db
        .delete(uploadedFilesTable)
        .where(eq(uploadedFilesTable.folderId, trashedItem.folderId));
      await db
        .delete(uploadFoldersTable)
        .where(eq(uploadFoldersTable.id, trashedItem.folderId));
    }

    return telegramIdsToRevoke.filter((id) => !isNaN(id));
  },
};
