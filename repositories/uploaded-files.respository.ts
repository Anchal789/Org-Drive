import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  recentTable,
  sharedItemsTable,
  trashedTable,
  uploadedFilesTable,
  uploadFoldersTable,
  userTable,
} from "@/db/schema";
import type { UploadFilesResponse } from "@/types/files";

export const uploadedFilesRepository = {
  async uploadFiles(files: Array<UploadFilesResponse & { userId: number }>) {
    const uploadedFiles = await db
      .insert(uploadedFilesTable)
      .values(files)
      .returning();
    const logs = uploadedFiles.map((file) => ({
      userId: file.userId,
      fileId: file.id,
      folderId: file.folderId || undefined,
      action: "uploaded",
      actionBy: file.userId,
    }));
    if (logs.length > 0) {
      await db.insert(recentTable).values(logs).catch(console.error);
    }
    return uploadedFiles;
  },
  async getFiles(userId: number) {
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
        and(
          eq(uploadedFilesTable.userId, userId),
          isNull(uploadedFilesTable.folderId),
          eq(uploadedFilesTable.isDeleted, false),
        ),
      );
    return files;
  },

  async getFilesInFolder(folderId: number) {
    return db
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
        and(
          eq(uploadedFilesTable.folderId, folderId),
          eq(uploadedFilesTable.isDeleted, false),
        ),
      );
  },
  async deleteFile(id: number) {
    const [deletedFile] = await db
      .update(uploadedFilesTable)
      .set({ isDeleted: true })
      .where(eq(uploadedFilesTable.id, id))
      .returning();

    if (deletedFile.folderId) {
      await db
        .update(uploadFoldersTable)
        .set({ fileCount: sql`${uploadFoldersTable.fileCount} - 1` })
        .where(eq(uploadFoldersTable.id, deletedFile.folderId));
    }
    let folderName = "";
    if (deletedFile.folderId) {
      const [folder] = await db
        .select({ name: uploadFoldersTable.name })
        .from(uploadFoldersTable)
        .where(eq(uploadFoldersTable.id, deletedFile.folderId));
      folderName = folder?.name || "";
    }

    await db.insert(trashedTable).values({
      userId: deletedFile.userId,
      fileId: deletedFile.id,
      folderId: deletedFile.folderId,
      fileName: deletedFile.name,
      folderName,
      size: deletedFile.size,
    });
    return deletedFile;
  },

  async getFile(userId: number, id: number) {
    return await db
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
        bookmark: sharedItemsTable.bookmark,
        folderId: uploadedFilesTable.folderId,
        ownerFirstName: userTable.firstName,
        ownerLastName: userTable.lastName,
      })
      .from(uploadedFilesTable)
      .leftJoin(userTable, eq(uploadedFilesTable.userId, userTable.id))
      .leftJoin(
        sharedItemsTable,
        eq(sharedItemsTable.fileId, uploadedFilesTable.id),
      )
      .where(
        and(
          eq(uploadedFilesTable.userId, userId),
          eq(uploadedFilesTable.id, id),
          eq(uploadedFilesTable.isDeleted, false),
        ),
      );
  },
  async getFilesByIds(fileIds: number[]) {
    if (!fileIds || fileIds.length === 0) return [];

    return await db
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
        bookmark: sharedItemsTable.bookmark,
        folderId: uploadedFilesTable.folderId,
        permission: sharedItemsTable.permission,
        ownerFirstName: userTable.firstName,
        ownerLastName: userTable.lastName,
      })
      .from(uploadedFilesTable)
      .leftJoin(userTable, eq(uploadedFilesTable.userId, userTable.id))
      .leftJoin(
        sharedItemsTable,
        eq(sharedItemsTable.fileId, uploadedFilesTable.id),
      )
      .where(
        and(
          inArray(uploadedFilesTable.id, fileIds),
          eq(uploadedFilesTable.isDeleted, false),
        ),
      );
  },
  async getFilesName(fileIds: number[]) {
    return await db
      .select({
        id: uploadedFilesTable.id,
        name: uploadedFilesTable.name,
      })
      .from(uploadedFilesTable)
      .where(
        and(
          eq(uploadedFilesTable.isDeleted, false),
          inArray(uploadedFilesTable.id, fileIds),
        ),
      );
  },
  async totalStorage(userId: number) {
    const files = await db
      .select({
        size: uploadedFilesTable.size,
      })
      .from(uploadedFilesTable)
      .where(and(eq(uploadedFilesTable.userId, userId)));

    const deletedFiles = await db
      .select({ size: trashedTable?.size })
      .from(trashedTable)
      .where(eq(trashedTable.isDeleted, false));
    const totalFiles = [...files, ...deletedFiles];
    return totalFiles;
  },
  async renameFile(id: number, newName: string, actorId: number) {
    const [file] = await db
      .select({
        ownerId: uploadedFilesTable.userId,
        folderId: uploadedFilesTable.folderId,
      })
      .from(uploadedFilesTable)
      .where(eq(uploadedFilesTable.id, id));

    if (!file) return null;

    const sharedRecords = await db
      .select({ sharedWithUserId: sharedItemsTable.sharedWithUserId })
      .from(sharedItemsTable)
      .where(eq(sharedItemsTable.fileId, id));

    const dashboardOwners = new Set<number>();
    dashboardOwners.add(actorId);
    dashboardOwners.add(file.ownerId);

    sharedRecords.forEach((record) => {
      if (record.sharedWithUserId) {
        dashboardOwners.add(record.sharedWithUserId);
      }
    });

    const logs = Array.from(dashboardOwners).map((dashboardUserId) => ({
      userId: dashboardUserId,
      fileId: id,
      folderId: file.folderId || undefined,
      action: "edited",
      actionBy: actorId,
    }));

    await db.insert(recentTable).values(logs);
    return await db
      .update(uploadedFilesTable)
      .set({ name: newName })
      .where(eq(uploadedFilesTable.id, id));
  },
};
