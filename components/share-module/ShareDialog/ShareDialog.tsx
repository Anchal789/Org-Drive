"use client";

import { useEffect, useMemo, useReducer } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { iconsWithPaths } from "@/constants/common-constants";
import { fetchFolderFromFile } from "@/lib/share";
import { useShareDialogStore } from "@/store/store";
import styles from "./ShareDialog.module.scss";
import { ShareWithMePerson } from "@/types/share-with-me";
import { User } from "@/types/auth";
import { useDebounce } from "@/hooks/use-debounce";
import { getUsersWithAccessAction } from "@/actions/share-actions";
import { postData } from "@/lib/api-fn";
import { toast } from "sonner";
import ShareHeader from "./ShareHeader";
import UserSearchBox from "./UserSearchBox";
import UserAccessRow from "./UserAccessRow";
import { Separator } from "@/components/ui/separator";
import FileType from "@/components/ui/fileType";
import { FileKind } from "@/types/dashboard";
import { UploadedFile } from "@/types/files";

type SharePermission = "viewer" | "editor" | "owner" | "commenter";

type InviteUser = User & { permission: SharePermission };

type ShareState = {
  searchTerm: string;
  parentFolderName: string | null;
  isLoading: boolean;
  usersWithAccess: ShareWithMePerson[];
  usersToInvite: InviteUser[];
};

const initialShareState: ShareState = {
  searchTerm: "",
  parentFolderName: null,
  isLoading: false,
  usersWithAccess: [],
  usersToInvite: [],
};

type ShareAction =
  | { type: "reset" }
  | { type: "set_search_term"; searchTerm: string }
  | { type: "set_loading"; isLoading: boolean }
  | { type: "set_parent_folder_name"; parentFolderName: string | null }
  | { type: "set_users_with_access"; usersWithAccess: ShareWithMePerson[] }
  | { type: "set_users_to_invite"; usersToInvite: InviteUser[] }
  | {
      type: "update_invite_permission";
      index: number;
      permission: InviteUser["permission"];
    }
  | {
      type: "update_access_permission";
      index: number;
      permission: ShareWithMePerson["permission"];
    };

function shareReducer(state: ShareState, action: ShareAction): ShareState {
  switch (action.type) {
    case "reset":
      return initialShareState;
    case "set_search_term":
      return { ...state, searchTerm: action.searchTerm };
    case "set_loading":
      return { ...state, isLoading: action.isLoading };
    case "set_parent_folder_name":
      return { ...state, parentFolderName: action.parentFolderName };
    case "set_users_with_access":
      return { ...state, usersWithAccess: action.usersWithAccess };
    case "set_users_to_invite":
      return { ...state, usersToInvite: action.usersToInvite };
    case "update_invite_permission":
      return {
        ...state,
        usersToInvite: state.usersToInvite.map((user, i) =>
          i === action.index
            ? { ...user, permission: action.permission }
            : user,
        ),
      };
    case "update_access_permission":
      return {
        ...state,
        usersWithAccess: state.usersWithAccess.map((user, i) =>
          i === action.index
            ? { ...user, permission: action.permission }
            : user,
        ),
      };
    default:
      return state;
  }
}

type InvitePeopleSectionProps = {
  users: InviteUser[];
  onPermissionChange: (
    index: number,
    permission: InviteUser["permission"],
  ) => void;
};

function InvitePeopleSection({
  users,
  onPermissionChange,
}: InvitePeopleSectionProps) {
  if (users.length === 0) return null;

  return (
    <div>
      <div className={styles.sectionLabel}>Invite people</div>
      <div className={styles.personsWithAccess}>
        {users.map((person, index) => (
          <UserAccessRow
            key={`invite-${person.id}`}
            user={person}
            permission={person.permission}
            hideOwnerOption
            onPermissionChange={(val) => onPermissionChange(index, val)}
            showSeparator={index < users.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

type PeopleWithAccessSectionProps = {
  users: ShareWithMePerson[];
  currentUserId: number;
  isMultiShare: boolean;
  onPermissionChange: (
    index: number,
    permission: ShareWithMePerson["permission"],
  ) => void;
};

function PeopleWithAccessSection({
  users,
  currentUserId,
  isMultiShare,
  onPermissionChange,
}: PeopleWithAccessSectionProps) {
  return (
    <div>
      <div className={styles.sectionLabel}>People with access</div>
      <div className={styles.personsWithAccess}>
        {users.map((person, index) => (
          <UserAccessRow
            key={`access-${person.id}`}
            user={person}
            permission={person.permission}
            isOwner={person.permission?.toLowerCase() === "owner"}
            isCurrentUser={person.id === currentUserId}
            disabled={person.id === currentUserId}
            // Block transferring ownership when doing bulk multi-file changes
            hideOwnerOption={isMultiShare}
            onPermissionChange={(val) => onPermissionChange(index, val)}
            showSeparator={index < users.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

export default function ShareDialog({
  userId,
  allUsers,
}: {
  userId: number;
  allUsers: Array<User>;
}) {
  const { open, setOpen, file, folder, files, onSuccess } =
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
      type: "set_search_term",
      searchTerm: typeof value === "function" ? value(searchTerm) : value,
    });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const isMultiShare = Array.isArray(files) && files.length > 1;

  const actualFile =
    file ||
    ((Array.isArray(files) && files.length === 1
      ? files[0]
      : undefined) as UploadedFile & { fileName?: string });
  const isSharingFolder = !!folder && !actualFile && !isMultiShare;
  const activeItem = actualFile || folder;

  const activeId = activeItem?.id;
  const activeUserId = activeItem?.userId;

  const multiFileIds =
    isMultiShare && files ? files.map((f) => f.id).join(",") : "";

  useEffect(() => {
    if (open && actualFile?.folderId && !isMultiShare) {
      dispatch({ type: "set_loading", isLoading: true });
      fetchFolderFromFile(
        Number(actualFile.userId),
        Number(actualFile.folderId),
      )
        .then((result) =>
          dispatch({
            type: "set_parent_folder_name",
            parentFolderName: result?.name ?? null,
          }),
        )
        .catch(console.error)
        .finally(() => dispatch({ type: "set_loading", isLoading: false }));
    }
  }, [open, actualFile, isMultiShare]);

  useEffect(() => {
    if (!open) return;

    if (isMultiShare && files && files.length > 0) {
      Promise.all(files.map((f) => getUsersWithAccessAction(f.id, f.userId)))
        .then((results) => {
          const mergedUsers = new Map<number, ShareWithMePerson>();
          results.flat().forEach((user) => {
            if (!mergedUsers.has(user.id)) {
              mergedUsers.set(user.id, user);
            }
          });

          dispatch({
            type: "set_users_with_access",
            usersWithAccess: Array.from(mergedUsers.values()),
          });
        })
        .catch(console.error);
      return;
    }

    if (!activeId || !activeUserId) return;
    getUsersWithAccessAction(activeId, activeUserId)
      .then((users) =>
        dispatch({ type: "set_users_with_access", usersWithAccess: users }),
      )
      .catch(console.error);
  }, [open, activeId, activeUserId, isMultiShare, multiFileIds]);

  useEffect(() => {
    if (!open) {
      dispatch({ type: "reset" });
    }
  }, [open]);

  const filteredUsers = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return [];
    const lowerTerm = debouncedSearchTerm.toLowerCase();

    return allUsers.filter((user) => {
      if (user.id === userId || user.id === activeUserId) return false;
      if (usersWithAccess.some((wa) => wa.id === user.id)) return false;

      const fullName =
        `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      const userName = (user.username || "").toLowerCase();
      return fullName.includes(lowerTerm) || userName.includes(lowerTerm);
    });
  }, [debouncedSearchTerm, allUsers, usersWithAccess, userId, activeUserId]);

  const handleInviteUser = async () => {
    try {
      const response = await postData({
        url: "/api/share",
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
        (error instanceof Error && error.message) || "Something went wrong",
      );
    }
  };

  if (!open || (!activeItem && !isMultiShare)) return null;

  let activeName: string | undefined = undefined;
  if (activeItem) {
    activeName =
      (activeItem.name ||
        ("fileName" in activeItem
          ? (activeItem.fileName as string)
          : undefined)) ??
      ("folderName" in activeItem
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
          onClose={() => setOpen(false)}
          isMultiShare={isMultiShare}
          multiFileCount={files?.length}
        />

        <UserSearchBox
          filteredUsers={filteredUsers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSelectUsers={(selected) => {
            dispatch({
              type: "set_users_to_invite",
              usersToInvite: selected.map((u) => ({
                ...u,
                permission: "viewer",
              })),
            });
          }}
        />

        {/* USERS TO INVITE */}
        <InvitePeopleSection
          users={usersToInvite}
          onPermissionChange={(index, permission) =>
            dispatch({ type: "update_invite_permission", index, permission })
          }
        />

        {/* EXISTING ACCESS */}
        <PeopleWithAccessSection
          users={usersWithAccess}
          currentUserId={userId}
          isMultiShare={isMultiShare}
          onPermissionChange={(index, permission) =>
            dispatch({ type: "update_access_permission", index, permission })
          }
        />

        {/* MULTIPLE FILES LIST (Placed right before the footer) */}
        {isMultiShare && files && files.length > 1 && (
          <div className={styles.multiFilesSection}>
            <div className={styles.sectionLabel}>Selected Items</div>
            <div className={styles.multiFileList}>
              {/* @ts-ignore - typing fallback if files array relies on generic schema structure */}
              {files.map((f: any) => {
                const fName = f.name || f.fileName || "Unknown file";
                const fExt = fName.split(".").pop() as FileKind;
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
          <Button variant="outline" size="sm">
            <Icon d={iconsWithPaths.link} size={14} />
            Copy link
          </Button>
          <div className={styles.footerSpacer} />
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleInviteUser}>
            {usersToInvite.length > 0 ? "Send invite" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
