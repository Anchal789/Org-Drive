import { sendError, sendSuccess } from "@/lib/api-response";
import { shareRepository } from "@/repositories/share.repository";
import { sharedWithMeRepository } from "@/repositories/shared-with-me.repository";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { usersToInvite, usersWithAccess, file, folder } = await request.json();

  if (!file && !folder) {
    return sendError("Missing Item to share", 400);
  }

  const itemId = file?.id || folder?.id;
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
    if (usersToInvite.length > 0) {
      for (const user of usersToInvite) {
        await shareRepository.uploadSharedItem(
          ownerId,
          file?.id || null,
          folder?.id || null,
          user.permission,
          user.userId,
        );
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
