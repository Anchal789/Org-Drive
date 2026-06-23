import { db } from "@/db";
import { uploadedFilesTable, uploadFoldersTable, userTable } from "@/db/schema";
import { uploadedFiles } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";

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
  async bookmarkItem(id: number, isFile: boolean, bookmark: boolean) {
    if (isFile) {
      return await db
        .update(uploadedFiles)
        .set({ bookmark })
        .where(eq(uploadedFiles.id, id));
    } else {
      return await db
        .update(uploadFoldersTable)
        .set({ bookmark })
        .where(eq(uploadFoldersTable.id, id));
    }
  },
};
