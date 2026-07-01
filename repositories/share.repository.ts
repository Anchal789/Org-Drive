// repositories/share.repository.ts
import { db } from "@/db";
import { sharedItemsTable } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";

export const shareRepository = {
  async uploadSharedItem(
    userId: number,
    fileId: number | null,
    folderId: number | null,
    permission: "viewer" | "editor" | "owner" | "commenter",
    sharedWithUserId: number,
  ) {
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

  async uploadSharedItemBulk(
    payloads: {
      userId: number;
      fileId: number | null;
      folderId: number | null;
      permission: "viewer" | "editor" | "owner" | "commenter";
      sharedWithUserId: number;
    }[],
  ) {
    if (payloads.length === 0) return;
    return await db.insert(sharedItemsTable).values(payloads);
  },

  async updateSharedItemPermissionsBulk(
    fileIds: number[],
    sharedWithUserId: number,
    permission: "viewer" | "editor" | "owner" | "commenter",
  ) {
    if (fileIds.length === 0) return;
    return await db
      .update(sharedItemsTable)
      .set({ permission })
      .where(
        and(
          inArray(sharedItemsTable.fileId, fileIds),
          eq(sharedItemsTable.sharedWithUserId, sharedWithUserId),
        ),
      );
  },
};
