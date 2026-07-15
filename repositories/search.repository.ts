import { and, eq, ilike } from 'drizzle-orm';
import { db } from '@/db';
import {
  sharedItemsTable,
  uploadedFilesTable,
  uploadFoldersTable,
} from '@/db/schema';

export const searchRepository = {
  async searchFilesAndFolders(userId: number, searchQuery: string) {
    // Format the query for SQL wildcard search (e.g., "%report%")
    const query = `%${searchQuery}%`;

    // 1. Search Owned Files
    const ownedFilesPromise = db
      .select()
      .from(uploadedFilesTable)
      .where(
        and(
          eq(uploadedFilesTable.userId, userId),
          ilike(uploadedFilesTable.name, query),
        ),
      );

    // 2. Search Owned Folders
    const ownedFoldersPromise = db
      .select()
      .from(uploadFoldersTable)
      .where(
        and(
          eq(uploadFoldersTable.userId, userId),
          ilike(uploadFoldersTable.name, query),
        ),
      );

    // 3. Search Shared Files
    const sharedFilesPromise = db
      .select({
        file: uploadedFilesTable, // Extract just the file data
      })
      .from(sharedItemsTable)
      .innerJoin(
        uploadedFilesTable,
        eq(sharedItemsTable.fileId, uploadedFilesTable.id),
      )
      .where(
        and(
          eq(sharedItemsTable.sharedWithUserId, userId),
          ilike(uploadedFilesTable.name, query),
        ),
      );

    // 4. Search Shared Folders
    const sharedFoldersPromise = db
      .select({
        folder: uploadFoldersTable, // Extract just the folder data
      })
      .from(sharedItemsTable)
      .innerJoin(
        uploadFoldersTable,
        eq(sharedItemsTable.folderId, uploadFoldersTable.id),
      )
      .where(
        and(
          eq(sharedItemsTable.sharedWithUserId, userId),
          ilike(uploadFoldersTable.name, query),
        ),
      );

    // Execute all 4 queries simultaneously
    const [ownedFiles, ownedFolders, sharedFilesRaw, sharedFoldersRaw] =
      await Promise.all([
        ownedFilesPromise,
        ownedFoldersPromise,
        sharedFilesPromise,
        sharedFoldersPromise,
      ]);

    // Format the shared results to match the owned results structure
    const sharedFiles = sharedFilesRaw.map((row) => ({
      ...row.file,
      isShared: true,
    }));
    const sharedFolders = sharedFoldersRaw.map((row) => ({
      ...row.folder,
      isShared: true,
    }));

    // Return everything grouped nicely
    return {
      files: [...ownedFiles, ...sharedFiles],
      folders: [...ownedFolders, ...sharedFolders],
    };
  },
};
