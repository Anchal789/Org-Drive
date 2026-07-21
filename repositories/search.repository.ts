import { and, eq, ilike } from 'drizzle-orm';
import { db } from '@/db';
import {
  sharedItemsTable,
  uploadedFilesTable,
  uploadFoldersTable,
} from '@/db/schema';

const SEARCH_RESULT_LIMIT = 50;

/** Escapes ILIKE wildcard characters so a literal `%`/`_`/`\` in the query matches literally. */
export const escapeLikePattern = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');

export const searchRepository = {
  async searchFilesAndFolders(userId: number, searchQuery: string) {
    // Format the query for SQL wildcard search (e.g., "%report%")
    const query = `%${escapeLikePattern(searchQuery)}%`;

    // 1. Search Owned Files
    const ownedFilesPromise = db
      .select()
      .from(uploadedFilesTable)
      .where(
        and(
          eq(uploadedFilesTable.userId, userId),
          ilike(uploadedFilesTable.name, query),
        ),
      )
      .limit(SEARCH_RESULT_LIMIT);

    // 2. Search Owned Folders
    const ownedFoldersPromise = db
      .select()
      .from(uploadFoldersTable)
      .where(
        and(
          eq(uploadFoldersTable.userId, userId),
          ilike(uploadFoldersTable.name, query),
        ),
      )
      .limit(SEARCH_RESULT_LIMIT);

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
      )
      .limit(SEARCH_RESULT_LIMIT);

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
      )
      .limit(SEARCH_RESULT_LIMIT);

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
