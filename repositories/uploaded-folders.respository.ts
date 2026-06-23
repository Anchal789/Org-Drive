import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { uploadedFilesTable, uploadFoldersTable, userTable } from "@/db/schema";

export const uploadedFoldersRepository = {
  async getFolders(userId: number) {
    const folders = await db
      .select({
        id: uploadFoldersTable.id,
        userId: uploadFoldersTable.userId,
        name: uploadFoldersTable.name,
        fileCount: uploadFoldersTable.fileCount,
        isDeleted: uploadFoldersTable.isDeleted,
        createdAt: uploadFoldersTable.createdAt,
        updatedAt: uploadFoldersTable.updatedAt,
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
      );
    return folders;
  },
  async deleteFolder(id: number) {
    await db.delete(uploadedFilesTable).where(eq(uploadedFilesTable.id, id));
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
  async getFoldersByIds(ids: number[]) {
    const folders = await db
      .select({
        id: uploadFoldersTable.id,
        userId: uploadFoldersTable.userId,
        name: uploadFoldersTable.name,
        fileCount: uploadFoldersTable.fileCount,
        isDeleted: uploadFoldersTable.isDeleted,
        createdAt: uploadFoldersTable.createdAt,
        updatedAt: uploadFoldersTable.updatedAt,
        ownerFirstName: userTable.firstName,
        ownerLastName: userTable.lastName,
      })
      .from(uploadFoldersTable)
      .leftJoin(userTable, eq(uploadFoldersTable.userId, userTable.id))
      .where(
        and(
          eq(uploadFoldersTable.isDeleted, false),
          inArray(uploadFoldersTable.id, ids),
        ),
      );
    return folders;
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
};
