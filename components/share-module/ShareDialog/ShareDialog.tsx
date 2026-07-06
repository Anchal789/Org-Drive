'use client';

import { Link } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useMemo, useReducer } from 'react';
import { toast } from 'sonner';
import { getUsersWithAccessAction } from '@/actions/share-actions';
import { Button } from '@/components/ui/button';
import FileType from '@/components/ui/fileType';
import { Separator } from '@/components/ui/separator';
import { useDebounce } from '@/hooks/use-debounce';
import { postData } from '@/lib/api-fn';
import { fetchFolderFromFile } from '@/lib/share';
import { encrypt } from '@/lib/utils';
import { useShareDialogStore } from '@/store/store';
import type { User } from '@/types/auth';
import type { FileKind } from '@/types/dashboard';
import type { UploadedFile } from '@/types/files';
import type { ShareWithMePerson } from '@/types/share-with-me';
import InvitePeopleSection from './InvitePeopleSection';
import PeopleWithAccessSection from './PeopleWithAccessSection';
import styles from './ShareDialog.module.scss';
import ShareHeader from './ShareHeader';
import { initialShareState, shareReducer } from './share-reducer';
import UserSearchBox from './UserSearchBox';

export default function ShareDialog({
  userId,
  allUsers,
}: {
  userId: number;
  allUsers: Array<User>;
}) {
  const { open, setOpen, file, folder, files, onSuccess, onCancel } =
    useShareDialogStore();

  const [state, dispatch] = useReducer(shareReducer, initialShareState);
  const {
    searchTerm,
    parentFolderName,
    isLoading,
    usersWithAccess,
    usersToInvite,
  } = state;

  const setSearchTerm: Dispatch<SetStateAction<string>> = (value) =>
    dispatch({
      type: 'set_search_term',
      searchTerm: typeof value === 'function' ? value(searchTerm) : value,
    });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const isMultiShare = Array.isArray(files) && files.length > 1;

  const isSharedFiles = isMultiShare
    ? files.some((f) => f?.shareId)
    : file?.shareId;

  const actualFile =
    file ||
    ((Array.isArray(files) && files.length === 1
      ? files[0]
      : undefined) as UploadedFile & { fileName?: string });
  const isSharingFolder = !!folder && !actualFile && !isMultiShare;
  const activeItem = actualFile || folder;

  const activeId = activeItem?.id;
  const activeUserId = activeItem?.userId;

  useEffect(() => {
    if (open && actualFile?.folderId && !isMultiShare) {
      dispatch({ type: 'set_loading', isLoading: true });
      fetchFolderFromFile(
        Number(actualFile.userId),
        Number(actualFile.folderId),
      )
        .then((result) =>
          dispatch({
            type: 'set_parent_folder_name',
            parentFolderName: result?.name ?? null,
          }),
        )
        .catch((err: unknown) => {
          void err;
        })
        .finally(() => dispatch({ type: 'set_loading', isLoading: false }));
    }
  }, [open, actualFile, isMultiShare]);

  useEffect(() => {
    if (!open) return;

    if (isMultiShare && files && files.length > 0) {
      Promise.all(files.map((f) => getUsersWithAccessAction(f.id, f.userId)))
        .then((results) => {
          const mergedUsers = new Map<number, ShareWithMePerson>();
          for (const user of results.flat()) {
            if (!mergedUsers.has(user.id)) {
              mergedUsers.set(user.id, user);
            }
          }

          dispatch({
            type: 'set_users_with_access',
            usersWithAccess: Array.from(mergedUsers.values()),
          });
        })
        .catch((err: unknown) => {
          void err;
        });
      return;
    }

    if (!activeId || !activeUserId) return;
    getUsersWithAccessAction(activeId, activeUserId)
      .then((users) =>
        dispatch({ type: 'set_users_with_access', usersWithAccess: users }),
      )
      .catch((err: unknown) => {
        void err;
      });
  }, [open, activeId, activeUserId, isMultiShare, files]);

  useEffect(() => {
    if (!open) {
      dispatch({ type: 'reset' });
    }
  }, [open]);

  const filteredUsers = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return [];
    const lowerTerm = debouncedSearchTerm.toLowerCase();

    return allUsers.filter((user) => {
      if (user.id === userId || user.id === activeUserId) return false;
      if (usersWithAccess.some((wa) => wa.id === user.id)) return false;

      const fullName =
        `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const userName = (user.username || '').toLowerCase();
      return fullName.includes(lowerTerm) || userName.includes(lowerTerm);
    });
  }, [debouncedSearchTerm, allUsers, usersWithAccess, userId, activeUserId]);

  const handleInviteUser = async () => {
    try {
      const response = await postData({
        url: '/api/share',
        payload: {
          usersToInvite: usersToInvite.map((u) => ({ ...u, userId: u.id })),
          usersWithAccess,
          file: actualFile,
          folder,
          files: isMultiShare ? files : undefined,
        },
      });

      if (response.success) {
        toast.success(response.message);
        setOpen(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.message);
      }
    } catch (error: unknown) {
      toast.error(
        (error instanceof Error && error.message) || 'Something went wrong',
      );
    }
  };

  const handleCopyLink = async () => {
    try {
      let payload: {
        type: 'file' | 'folder' | 'multi';
        ids: number[];
        userId?: number;
      } = {
        type: 'file',
        ids: [],
        userId: undefined,
      };

      if (isMultiShare && files && files.length > 0) {
        payload = {
          type: 'multi',
          ids: files.map((f) => f.id),
          userId: files[0].userId,
        };
      } else if (actualFile) {
        payload = {
          type: 'file',
          ids: [actualFile.id],
          userId: actualFile.userId,
        };
      } else if (folder) {
        payload = {
          type: 'folder',
          ids: [folder.id],
          userId: folder.userId,
        };
      }

      if (!payload.userId || !payload.ids || payload.ids.length === 0) {
        return toast.error('Failed to copy link');
      }

      const token = encrypt(JSON.stringify(payload));

      const url = `${window.location.origin}/share/${token}`;

      await navigator.clipboard.writeText(url);
      toast.success('Secure link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
      void err;
    }
  };

  if (!open || (!activeItem && !isMultiShare)) return null;

  let activeName: string | undefined;
  if (activeItem) {
    activeName =
      (activeItem.name ||
        ('fileName' in activeItem
          ? (activeItem.fileName as string)
          : undefined)) ??
      ('folderName' in activeItem
        ? (activeItem.folderName as string)
        : undefined);
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.dialog}>
        <ShareHeader
          activeName={activeName}
          isSharingFolder={isSharingFolder}
          fileName={actualFile?.name || actualFile?.fileName}
          folderId={actualFile?.folderId}
          isLoading={isLoading}
          parentFolderName={parentFolderName}
          onClose={() => {
            setOpen(false);
            onCancel?.();
          }}
          isMultiShare={isMultiShare}
          multiFileCount={files?.length}
        />

        <UserSearchBox
          filteredUsers={filteredUsers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSelectUsers={(selected) => {
            dispatch({
              type: 'set_users_to_invite',
              usersToInvite: selected.map((u) => ({
                ...u,
                permission: 'viewer',
              })),
            });
          }}
        />

        {/* USERS TO INVITE */}
        <InvitePeopleSection
          users={usersToInvite}
          onPermissionChange={(index, permission) =>
            dispatch({ type: 'update_invite_permission', index, permission })
          }
        />

        {/* EXISTING ACCESS */}
        <PeopleWithAccessSection
          users={usersWithAccess}
          currentUserId={userId}
          isMultiShare={isMultiShare}
          onPermissionChange={(index, permission) =>
            dispatch({ type: 'update_access_permission', index, permission })
          }
        />

        {isMultiShare && files && files.length > 1 && (
          <div className={styles.multiFilesSection}>
            <div className={styles.sectionLabel}>Selected Items</div>
            <div className={styles.multiFileList}>
              {files.map((f: UploadedFile & { fileName?: string }) => {
                const fName = f.name || f.fileName || 'Unknown file';
                const fExt = fName.split('.').pop() as FileKind;
                return (
                  <div key={f.id} className={styles.multiFileItem}>
                    <FileType kind={fExt} />
                    <span className={styles.multiFileName}>{fName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <Separator />
        <div className={styles.footer}>
          {!isSharedFiles && (
            <Button variant='outline' size='sm' onClick={handleCopyLink}>
              <Link size={14} />
              Copy link
            </Button>
          )}
          <div className={styles.footerSpacer} />
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              setOpen(false);
              onCancel?.();
            }}
          >
            Cancel
          </Button>
          <Button variant='primary' size='sm' onClick={handleInviteUser}>
            {usersToInvite.length > 0 ? 'Send invite' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
