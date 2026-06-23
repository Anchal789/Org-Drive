import { sharedItemsTable, userTable } from "./../db/schema";
import { db } from "@/db";
import { and, eq, ne, or, sql } from "drizzle-orm";

export const sharedWithMeRepository = {
  async getSharedWithMeFiles(userId: number) {
    return await db
      .select({
        id: sharedItemsTable.id,
        userId: sharedItemsTable.userId,
        fileId: sharedItemsTable.fileId,
        folderId: sharedItemsTable.folderId,
        permission: sharedItemsTable.permission,
        fileName: sharedItemsTable.fileName,
        folderName: sharedItemsTable.folderName,
        ownerFirstName: userTable.firstName,
        ownerLastName: userTable.lastName,
        sharedDate: sharedItemsTable.createdAt,
      })
      .from(sharedItemsTable)
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
  async renameSharedItem(id: number, newName: string) {
    const [folderOrFile] = await db
      .select()
      .from(sharedItemsTable)
      .where(eq(sharedItemsTable.id, id));
    if (!folderOrFile) return null;

    const name = folderOrFile.folderId ? "folderName" : "fileName";

    return await db
      .update(sharedItemsTable)
      .set({ [name]: newName })
      .where(eq(sharedItemsTable.id, id));
  },
  async getUsersWithFileAccess(id: number, ownerId: number) {
    const ownerDetails = await db
      .select({
        id: userTable.id,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
        username: userTable.username,
        permission: sql<string>`'owner'`,
      })
      .from(userTable)
      .where(eq(userTable.id, ownerId))
      .limit(1);

    const sharedUsers = await db
      .select({
        id: userTable.id,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
        username: userTable.username,
        permission: sharedItemsTable.permission,
        shareId: sharedItemsTable.id,
      })
      .from(sharedItemsTable)
      .innerJoin(userTable, eq(sharedItemsTable.sharedWithUserId, userTable.id))
      .where(
        and(
          or(
            eq(sharedItemsTable.fileId, id),
            eq(sharedItemsTable.folderId, id),
          ),
          ne(userTable.id, ownerId),
        ),
      );

    return [...ownerDetails, ...sharedUsers];
  },
};
