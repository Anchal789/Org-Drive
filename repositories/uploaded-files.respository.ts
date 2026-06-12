import { db } from "@/db";
import { uploadedFilesTable } from "@/db/schema";
import { UploadFilesResponse } from "@/types/files";
import { and, eq, isNull } from "drizzle-orm";

export const uploadedFilesRepository = {
  async uploadFiles(files: Array<UploadFilesResponse & { userId: number }>) {
    return db.insert(uploadedFilesTable).values(files).returning();
  },
  async getFiles(userId: number) {
    const files = await db
      .select()
      .from(uploadedFilesTable)
      .where(
        and(
          eq(uploadedFilesTable.userId, userId),
          isNull(uploadedFilesTable.folderId),
          eq(uploadedFilesTable.isDeleted, false),
        ),
      );
    return files;
  },

  async getFilesInFolder(userId: number, folderId: number) {
    return db
      .select()
      .from(uploadedFilesTable)
      .where(
        and(
          eq(uploadedFilesTable.userId, userId),
          eq(uploadedFilesTable.folderId, folderId),
          eq(uploadedFilesTable.isDeleted, false),
        ),
      );
  },
  async deleteFiles(id: number) {
    await db.delete(uploadedFilesTable).where(eq(uploadedFilesTable.id, id));
  },
};
