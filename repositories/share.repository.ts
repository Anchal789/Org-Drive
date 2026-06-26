import { db } from "@/db";
import {
  sharedItemsTable,
  uploadedFilesTable,
  uploadFoldersTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export const shareRepository = {
  async uploadSharedItem(
    userId: number,
    fileId: number | null,
    folderId: number | null,
    permission: "viewer" | "editor" | "owner" | "commenter",
    sharedWithUserId: number,
  ) {
    let fileName = null;

    if (fileId) {
      [fileName] = await db
        .select({ name: uploadedFilesTable.name })
        .from(uploadedFilesTable)
        .where(eq(uploadedFilesTable?.id, fileId));
    }

    let folderName = null;
    if (folderId) {
      [folderName] = await db
        .select({ name: uploadFoldersTable.name })
        .from(uploadFoldersTable)
        .where(eq(uploadFoldersTable?.id, folderId));
    }

    return await db.insert(sharedItemsTable).values({
      userId,
      fileId,
      folderId,
      permission,
      sharedWithUserId,
    });
  },
  async updateSharedItem(
    sharedItemId: number,
    permission: "viewer" | "editor" | "owner" | "commenter",
  ) {
    return await db
      .update(sharedItemsTable)
      .set({ permission })
      .where(eq(sharedItemsTable.id, sharedItemId));
  },
};
