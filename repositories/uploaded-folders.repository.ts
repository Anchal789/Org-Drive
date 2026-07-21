import { and, eq, inArray, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { uploadedFilesTable, uploadFoldersTable, userTable } from '@/db/schema';
import { sharedItemsTable, trashedTable } from './../db/schema';

export const uploadedFoldersRepository = {
  async getFolders(userId: number, limit = 5, offset = 0) {
    const folders = await db
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
          eq(uploadFoldersTable.isDeleted, false),
        ),
      )
      .limit(limit)
      .offset(offset);
    return folders;
  },
  async getCombinedFolders(userId: number, limit = 30, offset = 0) {
    return await db
      .select({
        id: uploadFoldersTable.id,
        userId: uploadFoldersTable.userId,
        name: uploadFoldersTable.name,
        fileCount: uploadFoldersTable.fileCount,
        isDeleted: uploadFoldersTable.isDeleted,
        createdAt: uploadFoldersTable.createdAt,
        updatedAt: uploadFoldersTable.updatedAt,
        bookmark: sql<boolean>`COALESCE(${sharedItemsTable.bookmark}, ${uploadFoldersTable.bookmark})`,
        ownerFirstName: userTable.firstName,
        ownerLastName: userTable.lastName,
        shareId: sharedItemsTable.id,
      })
      .from(uploadFoldersTable)
      .leftJoin(userTable, eq(uploadFoldersTable.userId, userTable.id))
      .leftJoin(
        sharedItemsTable,
        and(
          eq(sharedItemsTable.folderId, uploadFoldersTable.id),
          eq(sharedItemsTable.sharedWithUserId, userId),
        ),
      )
      .where(
        and(
          eq(uploadFoldersTable.isDeleted, false),
          or(
            eq(uploadFoldersTable.userId, userId),
            eq(sharedItemsTable.sharedWithUserId, userId),
          ),
        ),
      )
      .orderBy(uploadFoldersTable.id)
      .limit(limit)
      .offset(offset);
  },
  async deleteFolder(id: number, shareId: number, actorId: number) {
    if (shareId) {
      return await db
        .delete(sharedItemsTable)
        .where(
          and(
            eq(sharedItemsTable.id, shareId),
            eq(sharedItemsTable.sharedWithUserId, actorId),
          ),
        );
    }

    const [folder] = await db
      .select({
        name: uploadFoldersTable.name,
        userId: uploadFoldersTable.userId,
      })
      .from(uploadFoldersTable)
      .where(
        and(
          eq(uploadFoldersTable.id, id),
          eq(uploadFoldersTable.userId, actorId),
        ),
      );

    if (!folder) return null;
    const softDeletedFiles = await db
      .update(uploadedFilesTable)
      .set({ isDeleted: true })
      .where(
        and(
          eq(uploadedFilesTable.folderId, id),
          eq(uploadedFilesTable.isDeleted, false),
        ),
      )
      .returning();

    if (softDeletedFiles.length > 0) {
      const fileTrashRecords = softDeletedFiles.map((file) => ({
        userId: file.userId,
        fileId: file.id,
        fileName: file.name,
        folderId: id,
        folderName: folder.name,
        size: file.size,
      }));

      await db.insert(trashedTable).values(fileTrashRecords);
    }
    const totalFolderSize = softDeletedFiles.reduce(
      (acc, file) => acc + file.size,
      0,
    );

    await db.insert(trashedTable).values({
      userId: folder.userId,
      fileId: null,
      fileName: null,
      folderId: id,
      folderName: folder.name,
      size: totalFolderSize,
    });

    return await db
      .update(uploadFoldersTable)
      .set({ isDeleted: true })
      .where(eq(uploadFoldersTable.id, id));
  },
  async getFolder(userId: number, id: number) {
    const [folder] = await db
      .select()
      .from(uploadFoldersTable)
      .where(
        and(
          eq(uploadFoldersTable.userId, userId),
          eq(uploadFoldersTable.id, id),
          eq(uploadFoldersTable.isDeleted, false),
        ),
      );
    return folder;
  },
  async getFoldersByIds(ids: number[], currentUserId: number) {
    const folders = await db
      .select({
        id: uploadFoldersTable.id,
        userId: uploadFoldersTable.userId,
        name: uploadFoldersTable.name,
        fileCount: uploadFoldersTable.fileCount,
        isDeleted: uploadFoldersTable.isDeleted,
        createdAt: uploadFoldersTable.createdAt,
        updatedAt: uploadFoldersTable.updatedAt,
        bookmark: sharedItemsTable.bookmark,
        permission: sharedItemsTable.permission,
        ownerFirstName: userTable.firstName,
        ownerLastName: userTable.lastName,
      })
      .from(uploadFoldersTable)
      .leftJoin(userTable, eq(uploadFoldersTable.userId, userTable.id))
      .leftJoin(
        sharedItemsTable,
        and(
          eq(uploadFoldersTable.id, sharedItemsTable.folderId),
          eq(sharedItemsTable.sharedWithUserId, currentUserId),
        ),
      )
      .where(
        and(
          eq(uploadFoldersTable.isDeleted, false),
          inArray(uploadFoldersTable.id, ids),
        ),
      );

    return folders;
  },
  async getFolderById(id: number) {
    const [folder] = await db
      .select()
      .from(uploadFoldersTable)
      .where(eq(uploadFoldersTable.id, id));
    return folder;
  },
  async getFoldersName(ids: number[]) {
    const folders = await db
      .select({
        id: uploadFoldersTable.id,
        name: uploadFoldersTable.name,
      })
      .from(uploadFoldersTable)
      .where(
        and(
          eq(uploadFoldersTable.isDeleted, false),
          inArray(uploadFoldersTable.id, ids),
        ),
      );
    return folders;
  },
  async getAllFoldersWithIdName(userId: number) {
    const folders = await db
      .select({
        id: uploadFoldersTable.id,
        name: uploadFoldersTable.name,
      })
      .from(uploadFoldersTable)
      .where(
        and(
          eq(uploadFoldersTable.userId, userId),
          eq(uploadFoldersTable.isDeleted, false),
        ),
      );
    return folders;
  },
  async renameFolder(id: number, newName: string, actorId: number) {
    const [existingShare] = await db
      .select({ permission: sharedItemsTable.permission })
      .from(sharedItemsTable)
      .where(
        and(
          eq(sharedItemsTable.folderId, id),
          eq(sharedItemsTable.sharedWithUserId, actorId),
        ),
      );
    const canEdit =
      existingShare?.permission === 'editor' ||
      existingShare?.permission === 'owner';

    return await db
      .update(uploadFoldersTable)
      .set({ name: newName })
      .where(
        and(
          eq(uploadFoldersTable.id, id),
          canEdit
            ? undefined
            : eq(uploadFoldersTable.userId, actorId),
        ),
      );
  },
  /** Returns the folder only if `userId` owns it or has an explicit share grant on it. */
  async getAccessibleFolder(userId: number, id: number) {
    const [folder] = await db
      .select({
        id: uploadFoldersTable.id,
        userId: uploadFoldersTable.userId,
        name: uploadFoldersTable.name,
      })
      .from(uploadFoldersTable)
      .leftJoin(
        sharedItemsTable,
        and(
          eq(sharedItemsTable.folderId, uploadFoldersTable.id),
          eq(sharedItemsTable.sharedWithUserId, userId),
        ),
      )
      .where(
        and(
          eq(uploadFoldersTable.id, id),
          eq(uploadFoldersTable.isDeleted, false),
          or(
            eq(uploadFoldersTable.userId, userId),
            sql`${sharedItemsTable.id} is not null`,
          ),
        ),
      );
    return folder ?? null;
  },
  async getCountOfFolderSharedWith(folderId: number) {
    const folders = await db
      .select()
      .from(sharedItemsTable)
      .where(eq(sharedItemsTable.folderId, folderId));

    return folders;
  },
  async setFileCount(id: number) {
    return await db
      .update(uploadFoldersTable)
      .set({ fileCount: sql`${uploadFoldersTable.fileCount} + 1` })
      .where(eq(uploadFoldersTable.id, id));
  },
};
