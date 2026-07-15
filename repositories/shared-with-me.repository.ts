import { and, count, eq, ne, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  sharedItemsTable,
  uploadedFilesTable,
  uploadFoldersTable,
  userTable,
} from './../db/schema';

export const sharedWithMeRepository = {
  async getSharedWithMeFiles(userId: number, limit = 30, offset = 0) {
    return await db
      .select({
        id: sharedItemsTable.id,
        userId: sharedItemsTable.userId,
        fileId: sharedItemsTable.fileId,
        folderId: sharedItemsTable.folderId,
        permission: sharedItemsTable.permission,
        fileName: sql<string>`COALESCE(${uploadedFilesTable.name}, ${uploadedFilesTable.name})`,
        bookmark: sharedItemsTable.bookmark,
        folderName: uploadFoldersTable.name,
        ownerFirstName: userTable.firstName,
        ownerLastName: userTable.lastName,
        sharedDate: sharedItemsTable.createdAt,
      })
      .from(sharedItemsTable)
      .leftJoin(userTable, eq(sharedItemsTable.userId, userTable.id))
      .leftJoin(
        uploadFoldersTable,
        eq(sharedItemsTable.folderId, uploadFoldersTable.id),
      )
      .leftJoin(
        uploadedFilesTable,
        eq(sharedItemsTable.fileId, uploadedFilesTable.id),
      )
      .where(eq(sharedItemsTable.sharedWithUserId, userId))
      .limit(limit)
      .offset(offset);
  },
  async getSharedFileUsersAndPermissions(id: number) {
    return await db
      .select()
      .from(sharedItemsTable)
      .where(or(eq(sharedItemsTable.id, id), eq(sharedItemsTable.id, id)));
  },
  async getUsersWithFileAccess(id: number, ownerId: number) {
    const [ownerDetails, sharedUsers] = await Promise.all([
      db
        .select({
          id: userTable.id,
          firstName: userTable.firstName,
          lastName: userTable.lastName,
          username: userTable.username,
          permission: sql<string>`'owner'`,
        })
        .from(userTable)
        .where(eq(userTable.id, ownerId))
        .limit(1),
      db
        .select({
          id: userTable.id,
          firstName: userTable.firstName,
          lastName: userTable.lastName,
          username: userTable.username,
          permission: sharedItemsTable.permission,
          shareId: sharedItemsTable.id,
        })
        .from(sharedItemsTable)
        .innerJoin(
          userTable,
          eq(sharedItemsTable.sharedWithUserId, userTable.id),
        )
        .where(
          and(
            or(
              eq(sharedItemsTable.fileId, id),
              eq(sharedItemsTable.folderId, id),
            ),
            ne(userTable.id, ownerId),
          ),
        ),
    ]);

    return [...ownerDetails, ...sharedUsers];
  },
  async deleteSharedItem(id: number) {
    return await db.delete(sharedItemsTable).where(eq(sharedItemsTable.id, id));
  },
  async getSharedWithMeFileCount(userId: number) {
    const [sharedWithMeFileCount] = await db
      .select({
        count: count(sharedItemsTable.id),
      })
      .from(sharedItemsTable)
      .where(eq(sharedItemsTable.sharedWithUserId, userId));
    return sharedWithMeFileCount.count;
  },
};
