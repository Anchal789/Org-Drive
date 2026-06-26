import { db } from "@/db";
import {
  recentTable,
  uploadedFilesTable,
  uploadFoldersTable,
  userTable,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const recentRepository = {
  async getRecentFiles(userId: number) {
    return await db
      .select({
        id: recentTable.id,
        fileId: recentTable.fileId,
        folderId: recentTable.folderId,
        action: recentTable.action,
        actionBy: recentTable.actionBy,
        createdAt: recentTable.createdAt,
        editorFirstName: userTable.firstName,
        editorLastName: userTable.lastName,
        fileName: uploadedFilesTable.name,
        fileSize: uploadedFilesTable.size,
        folderName: uploadFoldersTable.name,
      })
      .from(recentTable)
      .leftJoin(userTable, eq(recentTable.actionBy, userTable.id))
      .leftJoin(
        uploadedFilesTable,
        eq(recentTable.fileId, uploadedFilesTable.id),
      )
      .leftJoin(
        uploadFoldersTable,
        eq(recentTable.folderId, uploadFoldersTable.id),
      )
      .where(eq(recentTable.userId, userId))
      .orderBy(desc(recentTable.createdAt));
  },
};
