import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { uploadedFilesTable, uploadFoldersTable } from "@/db/schema";

export const uploadedFoldersRepository = {
  async getFolders(userId: number) {
    const folders = await db
      .select()
      .from(uploadFoldersTable)
      .where(
        and(
          eq(uploadFoldersTable.userId, userId),
          eq(uploadFoldersTable.isDeleted, false),
        ),
      );
    return folders;
  },
  async deleteFolder(id: number) {
    await db.delete(uploadedFilesTable).where(eq(uploadedFilesTable.id, id));
  },
};
