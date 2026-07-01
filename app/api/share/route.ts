import { sendError, sendSuccess } from "@/lib/api-response";
import { shareRepository } from "@/repositories/share.repository";
import { sharedWithMeRepository } from "@/repositories/shared-with-me.repository";
import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/session";
import { db } from "@/db";
import { recentTable } from "@/db/schema";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  const actorId = Number(session?.userId);

  if (!actorId) return sendError("Unauthorized", 401);

  const { usersToInvite, usersWithAccess, file, folder, files } =
    await request.json();

  const isMultiShare = Array.isArray(files) && files.length > 1;

  if (isMultiShare) {
    try {
      const logs: any[] = [];
      const insertPayloads: any[] = [];
      const fileIds = files.map((f: any) => Number(f.id));

      if (usersToInvite && usersToInvite.length > 0) {
        for (const user of usersToInvite) {
          const recipientId = Number(user.userId || user.id);

          for (const f of files) {
            insertPayloads.push({
              userId: Number(f.userId),
              fileId: Number(f.id),
              folderId: f.folderId ? Number(f.folderId) : null,
              permission: user.permission,
              sharedWithUserId: recipientId,
            });

            logs.push({
              userId: actorId,
              fileId: Number(f.id),
              folderId: f.folderId ? Number(f.folderId) : null,
              action: "shared",
              actionBy: actorId,
            });

            logs.push({
              userId: recipientId,
              fileId: Number(f.id),
              folderId: f.folderId ? Number(f.folderId) : null,
              action: "shared",
              actionBy: actorId,
            });
          }
        }

        if (insertPayloads.length > 0) {
          await shareRepository.uploadSharedItemBulk(insertPayloads);
        }
      }

      if (usersWithAccess && usersWithAccess.length > 0) {
        for (const user of usersWithAccess) {
          if (user.permission === "owner") continue;

          await shareRepository.updateSharedItemPermissionsBulk(
            fileIds,
            Number(user.id),
            user.permission,
          );
        }
      }

      if (logs.length > 0) {
        await db.insert(recentTable).values(logs).catch(console.error);
      }

      return sendSuccess(null, "Multiple files shared successfully", 200);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("Bulk Share API Error:", errMsg);
      return sendError("Failed to process bulk sharing", 500);
    }
  }

  if (!file && !folder) {
    return sendError("Missing Item to share", 400);
  }

  const actualFileId = file?.fileId || file?.id || null;
  const actualFolderId =
    file?.folderId || folder?.folderId || folder?.id || null;

  const itemId = actualFileId || actualFolderId;
  const ownerId = file?.userId || folder?.userId;

  const currentDbState = await sharedWithMeRepository.getUsersWithFileAccess(
    itemId,
    ownerId,
  );

  const recordsToUpdate = usersWithAccess.filter((frontendUser: any) => {
    const dbUser = currentDbState.find((user) => user.id === frontendUser.id);
    return dbUser && dbUser.permission !== frontendUser.permission;
  });

  if (usersToInvite.length === 0 && recordsToUpdate.length === 0) {
    return sendError("No changes detected", 400);
  }

  try {
    const logs = [];

    if (usersToInvite.length > 0) {
      logs.push({
        userId: actorId,
        fileId: actualFileId || undefined,
        folderId: actualFolderId ? actualFolderId : null,
        action: "shared",
        actionBy: actorId,
      });

      for (const user of usersToInvite) {
        await shareRepository.uploadSharedItem(
          ownerId,
          actualFileId,
          actualFolderId,
          user.permission,
          user.userId,
        );

        logs.push({
          userId: user.userId,
          fileId: actualFileId || undefined,
          folderId: actualFolderId || undefined,
          action: "shared",
          actionBy: actorId,
        });
      }
    }

    if (recordsToUpdate.length > 0) {
      for (const record of recordsToUpdate) {
        if (record.shareId) {
          await shareRepository.updateSharedItem(
            record.shareId,
            record.permission,
          );
        }
      }
    }

    if (logs.length > 0) {
      await db.insert(recentTable).values(logs).catch(console.error);
    }

    return sendSuccess(
      null,
      `${file ? "File" : "Folder"} shared successfully`,
      200,
    );
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Share API Error:", errMsg);
    return sendError("Failed to process sharing", 500);
  }
}
