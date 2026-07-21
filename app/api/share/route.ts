import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { recentTable } from '@/db/schema';
import { sendError, sendSuccess } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { requireApiSession } from '@/lib/require-auth';
import { shareRepository } from '@/repositories/share.repository';
import { sharedWithMeRepository } from '@/repositories/shared-with-me.repository';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.repository';
import { uploadedFoldersRepository } from '@/repositories/uploaded-folders.repository';
import type { ShareApiRequestBody, SharePermission } from '@/types/share';

// Only allow revalidating same-origin, relative app paths — never an absolute
// URL or a path containing a protocol/host, which `revalidatePath` would still accept.
const SAFE_PATH_NAME = /^\/[a-zA-Z0-9\-_/]*$/;

function revalidateSafePath(pathName: string | undefined) {
  if (pathName && SAFE_PATH_NAME.test(pathName)) {
    revalidatePath(pathName);
  }
}

async function handleMultiShare(
  actorId: number,
  body: ShareApiRequestBody & {
    files: NonNullable<ShareApiRequestBody['files']>;
  },
) {
  const { usersToInvite, usersWithAccess, files, pathName } = body;

  try {
    const fileIds = files.map((f) => Number(f.id));

    const realFiles = await uploadedFilesRepository.getFilesByIds(fileIds);
    const realOwnerById = new Map(
      realFiles.map((f) => [f.id, Number(f.userId)]),
    );

    const notOwned = fileIds.some((id) => realOwnerById.get(id) !== actorId);
    if (realFiles.length !== fileIds.length || notOwned) {
      return sendError('You can only share files you own', 403);
    }

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

    if (usersToInvite && usersToInvite.length > 0) {
      for (const user of usersToInvite) {
        const recipientId = Number(user.userId || user.id);

        for (const f of files) {
          insertPayloads.push({
            userId: Number(realOwnerById.get(Number(f.id))),
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
        .catch((err) => {
          logger.warn('Failed to record recent-activity log for bulk share', {
            error: err instanceof Error ? err.message : String(err),
          });
        });
    }

    revalidateSafePath(pathName);
    return sendSuccess(null, 'Multiple files shared successfully', 200);
  } catch {
    return sendError('Failed to process bulk sharing', 500);
  }
}

async function handleSingleShare(actorId: number, body: ShareApiRequestBody) {
  const { usersToInvite, usersWithAccess, file, folder, pathName } = body;

  if (!file && !folder) {
    return sendError('Missing Item to share', 400);
  }

  const actualFileId = file?.fileId || file?.id || null;
  const actualFolderId =
    file?.folderId || folder?.folderId || folder?.id || null;

  const itemId = actualFileId || actualFolderId;

  let ownerId: number | undefined;
  if (actualFileId) {
    const [realFile] = await uploadedFilesRepository.getFilesByIds([
      Number(actualFileId),
    ]);
    ownerId = realFile ? Number(realFile.userId) : undefined;
  } else if (actualFolderId) {
    const realFolder = await uploadedFoldersRepository.getFolderById(
      Number(actualFolderId),
    );
    ownerId = realFolder ? Number(realFolder.userId) : undefined;
  }

  if (!ownerId || ownerId !== actorId) {
    return sendError('You can only share items you own', 403);
  }

  const currentDbState = await sharedWithMeRepository.getUsersWithFileAccess(
    Number(itemId),
    Number(ownerId),
  );

  const recordsToUpdate = usersWithAccess
    .map((frontendUser) => {
      const dbUser = currentDbState.find((user) => user.id === frontendUser.id);
      if (!dbUser || dbUser.permission === frontendUser.permission) {
        return null;
      }
      return { shareId: dbUser.shareId, permission: frontendUser.permission };
    })
    .filter(
      (record): record is { shareId: number; permission: SharePermission } =>
        record !== null && record.shareId != null,
    );

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
        updatePromises.push(
          shareRepository.updateSharedItem(
            record.shareId,
            record.permission,
            actorId,
          ),
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
        .catch((err) => {
          logger.warn('Failed to record recent-activity log for share', {
            error: err instanceof Error ? err.message : String(err),
          });
        });
    }

    revalidateSafePath(pathName);

    return sendSuccess(
      null,
      `${file ? 'File' : 'Folder'} shared successfully`,
      200,
    );
  } catch {
    return sendError('Failed to process sharing', 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await requireApiSession(request);
  if (session instanceof NextResponse) return session;
  const actorId = Number(session.userId);

  const body = (await request.json()) as ShareApiRequestBody;
  const isMultiShare = Array.isArray(body.files) && body.files.length > 1;

  if (isMultiShare) {
    return handleMultiShare(
      actorId,
      body as ShareApiRequestBody & {
        files: NonNullable<ShareApiRequestBody['files']>;
      },
    );
  }

  return handleSingleShare(actorId, body);
}
