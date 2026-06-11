import { db } from "@/db";
import { uploadedFilesTable } from "@/db/schema";
import { UploadFilesResponse } from "@/types/files";
import { eq } from "drizzle-orm";

export const uploadedFilesRepository = {
  async uploadFiles(files: Array<UploadFilesResponse & { userId: number }>) {
    return db.insert(uploadedFilesTable).values(files).returning();
  },
  async getFiles(userId: number) {
    const files = await db
      .select()
      .from(uploadedFilesTable)
      .where(eq(uploadedFilesTable.userId, userId));
    return files;
  },
  async deleteFiles(id: number) {
    await db.delete(uploadedFilesTable).where(eq(uploadedFilesTable.id, id));
  },
};
