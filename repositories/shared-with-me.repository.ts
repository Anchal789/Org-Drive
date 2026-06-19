import {
  sharedItemsTable,
  uploadedFilesTable,
  uploadFoldersTable,
  userTable,
} from "./../db/schema";
import { db } from "@/db";
import { eq, or } from "drizzle-orm";

export const sharedWithMeRepository = {
  async getSharedWithMeFiles(userId: number) {
    return await db
      .select({
        id: sharedItemsTable.id,
        userId: sharedItemsTable.userId,
        fileId: sharedItemsTable.fileId,
        folderId: sharedItemsTable.folderId,
        permission: sharedItemsTable.permission,
        fileName: uploadedFilesTable.name,
        folderName: uploadFoldersTable.name,
        ownerFirstName: userTable.firstName,
        ownerLastName: userTable.lastName,
        sharedDate: sharedItemsTable.createdAt,
      })
      .from(sharedItemsTable)
      .leftJoin(
        uploadedFilesTable,
        eq(sharedItemsTable.fileId, uploadedFilesTable.id),
      )
      .leftJoin(
        uploadFoldersTable,
        eq(sharedItemsTable.folderId, uploadFoldersTable.id),
      )
      .leftJoin(userTable, eq(sharedItemsTable.userId, userTable.id))
      .where(eq(sharedItemsTable.sharedWithUserId, userId));
  },
  async getSharedFileUsersAndPermissions(id: number) {
    return await db
      .select()
      .from(sharedItemsTable)
      .where(
        or(eq(sharedItemsTable.fileId, id), eq(sharedItemsTable.folderId, id)),
      );
  },
};
