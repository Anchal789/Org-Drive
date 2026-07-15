import type { NextRequest } from 'next/server';
import { db } from '@/db';
import { recentTable } from '@/db/schema';
import { sendError, sendSuccess } from '@/lib/api-response';
import { getApiSession } from '@/lib/session';
import { shareRepository } from '@/repositories/share.repository';
import { sharedWithMeRepository } from '@/repositories/shared-with-me.repository';
import type { ShareApiRequestBody, SharePermission } from '@/types/share';

export async function POST(request: NextRequest) {
  const session = await getApiSession(request);

  if (!session?.userId) {
    return sendError('Access token missing or expired', 401);
  }
  const actorId = Number(session.userId);

  const { usersToInvite, usersWithAccess, file, folder, files } =
    (await request.json()) as ShareApiRequestBody;

  const isMultiShare = Array.isArray(files) && files.length > 1;

  if (isMultiShare) {
    try {
      const logs: Array<{
        userId: number;
        fileId: number;
        folderId: number | null;
        action: string;
        actionBy: number;
      }> = [];
      const insertPayloads: Array<{
        userId: number;
        fileId: number;
        folderId: number | null;
        permission: SharePermission;
        sharedWithUserId: number;
      }> = [];
      const fileIds = files.map((f) => Number(f.id));

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
              action: 'shared',
              actionBy: actorId,
            });

            logs.push({
              userId: recipientId,
              fileId: Number(f.id),
              folderId: f.folderId ? Number(f.folderId) : null,
              action: 'shared',
              actionBy: actorId,
            });
          }
        }

        if (insertPayloads.length > 0) {
          await shareRepository.uploadSharedItemBulk(insertPayloads);
        }
      }

      if (usersWithAccess && usersWithAccess.length > 0) {
        const permissionUpdates: ReturnType<
          typeof shareRepository.updateSharedItemPermissionsBulk
        >[] = [];

        for (const user of usersWithAccess) {
          if (user.permission === 'owner') continue;
          permissionUpdates.push(
            shareRepository.updateSharedItemPermissionsBulk(
              fileIds,
              user.id,
              user.permission,
            ),
          );
        }

        await Promise.all(permissionUpdates);
      }

      if (logs.length > 0) {
        await db
          .insert(recentTable)
          .values(logs)
          .catch(() => {
            void 0;
          });
      }

      return sendSuccess(null, 'Multiple files shared successfully', 200);
    } catch {
      return sendError('Failed to process bulk sharing', 500);
    }
  }

  if (!file && !folder) {
    return sendError('Missing Item to share', 400);
  }

  const actualFileId = file?.fileId || file?.id || null;
  const actualFolderId =
    file?.folderId || folder?.folderId || folder?.id || null;

  const itemId = actualFileId || actualFolderId;
  const ownerId = file?.userId || folder?.userId;

  const currentDbState = await sharedWithMeRepository.getUsersWithFileAccess(
    Number(itemId),
    Number(ownerId),
  );

  const recordsToUpdate = usersWithAccess.filter((frontendUser) => {
    const dbUser = currentDbState.find((user) => user.id === frontendUser.id);
    return dbUser && dbUser.permission !== frontendUser.permission;
  });

  if (usersToInvite.length === 0 && recordsToUpdate.length === 0) {
    return sendError('No changes detected', 400);
  }

  try {
    const logs: Array<{
      userId: number;
      fileId?: number;
      folderId?: number | null;
      action: string;
      actionBy: number;
    }> = [];

    if (usersToInvite.length > 0) {
      logs.push({
        userId: actorId,
        fileId: actualFileId || undefined,
        folderId: actualFolderId ? actualFolderId : null,
        action: 'shared',
        actionBy: actorId,
      });

      await Promise.all(
        usersToInvite.map(async (user) => {
          await shareRepository.uploadSharedItem(
            Number(ownerId),
            actualFileId,
            actualFolderId,
            user.permission,
            user.userId ?? user.id,
          );

          logs.push({
            userId: user.userId ?? user.id,
            fileId: actualFileId || undefined,
            folderId: actualFolderId || undefined,
            action: 'shared',
            actionBy: actorId,
          });
        }),
      );
    }

    if (recordsToUpdate.length > 0) {
      const updatePromises: ReturnType<
        typeof shareRepository.updateSharedItem
      >[] = [];

      for (const record of recordsToUpdate) {
        if (!record.shareId) continue;
        updatePromises.push(
          shareRepository.updateSharedItem(record.shareId, record.permission),
        );
      }

      await Promise.all(updatePromises);
    }

    if (logs.length > 0) {
      await db
        .insert(recentTable)
        .values(
          logs as Array<{
            userId: number;
            fileId: number;
            folderId: number | null;
            action: string;
            actionBy: number;
          }>,
        )
        .catch(() => {
          void 0;
        });
    }

    return sendSuccess(
      null,
      `${file ? 'File' : 'Folder'} shared successfully`,
      200,
    );
  } catch {
    return sendError('Failed to process sharing', 500);
  }
}
