import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { uploadedFilesTable } from '@/db/schema';
import type { UploadFilesResponse } from '@/types/files';

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
  async deleteFile(id: number) {
    const [deletedFile] = await db
      .update(uploadedFilesTable)
      .set({ isDeleted: true })
      .where(eq(uploadedFilesTable.id, id))
      .returning();

    return deletedFile;
  },
  async getFile(userId: number, id: number) {
    return await db
      .select()
      .from(uploadedFilesTable)
      .where(
        and(
          eq(uploadedFilesTable.userId, userId),
          eq(uploadedFilesTable.id, id),
          eq(uploadedFilesTable.isDeleted, false),
        ),
      );
  },
  async totalStorage(userId: number) {
    return await db
      .select({
        size: uploadedFilesTable.size,
      })
      .from(uploadedFilesTable)
      .where(
        and(
          eq(uploadedFilesTable.userId, userId),
          eq(uploadedFilesTable.isDeleted, false),
        ),
      );
  },
};
