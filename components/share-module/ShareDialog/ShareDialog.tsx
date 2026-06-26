"use client";

import { useEffect, useState, useMemo } from "react";
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

export default function ShareDialog({
  userId,
  allUsers,
}: {
  userId: number;
  allUsers: Array<User>;
}) {
  const { open, setOpen, file, folder } = useShareDialogStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [parentFolderName, setParentFolderName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [usersWithAccess, setUsersWithAccess] = useState<ShareWithMePerson[]>(
    [],
  );
  const [usersToInvite, setUsersToInvite] = useState<
    Array<User & { permission: "viewer" | "editor" | "owner" | "commenter" }>
  >([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const isSharingFolder = !!folder && !file;
  const activeItem = file || folder;
  const activeId = activeItem?.id;
  const activeUserId = activeItem?.userId;

  useEffect(() => {
    if (open && file?.folderId) {
      setIsLoading(true);
      fetchFolderFromFile(Number(file.userId), Number(file.folderId))
        .then((result) => setParentFolderName(result?.name ?? null))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [open, file]);

  useEffect(() => {
    if (!open || (!file && !folder)) return;
    if (!activeId || !activeUserId) return;
    getUsersWithAccessAction(activeId, activeUserId).then(setUsersWithAccess);
  }, [open, file, folder, activeId, activeUserId]);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setParentFolderName(null);
      setIsLoading(false);
      setUsersWithAccess([]);
      setUsersToInvite([]);
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
          file,
          folder,
        },
      });

      if (response.success) {
        toast.success(response.message);
        setOpen(false);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  if (!open || !activeItem) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.dialog}>
        <ShareHeader
          activeName={
            (activeItem.name ||
              ("fileName" in activeItem ? activeItem.fileName : undefined)) ??
            ("folderName" in activeItem ? activeItem.folderName : undefined)
          }
          isSharingFolder={isSharingFolder}
          fileName={file?.name || file?.fileName}
          folderId={file?.folderId}
          isLoading={isLoading}
          parentFolderName={parentFolderName}
          onClose={() => setOpen(false)}
        />

        <UserSearchBox
          filteredUsers={filteredUsers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSelectUsers={(selected) => {
            setUsersToInvite(
              selected.map((u) => ({ ...u, permission: "viewer" })),
            );
          }}
        />

        {/* USERS TO INVITE */}
        {usersToInvite.length > 0 && (
          <div>
            <div className={styles.sectionLabel}>Invite people</div>
            <div className={styles.personsWithAccess}>
              {usersToInvite.map((person, index) => (
                <UserAccessRow
                  key={`invite-${person.id}`}
                  user={person}
                  permission={person.permission}
                  hideOwnerOption={true}
                  onPermissionChange={(val) => {
                    const updated = [...usersToInvite];
                    updated[index].permission = val;
                    setUsersToInvite(updated);
                  }}
                  showSeparator={index < usersToInvite.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* EXISTING ACCESS */}
        <div>
          <div className={styles.sectionLabel}>People with access</div>
          <div className={styles.personsWithAccess}>
            {usersWithAccess.map((person, index) => (
              <UserAccessRow
                key={`access-${person.id}`}
                user={person}
                permission={person.permission}
                isOwner={person.permission?.toLowerCase() === "owner"}
                isCurrentUser={person.id === userId}
                disabled={person.id === userId}
                onPermissionChange={(val) => {
                  const updated = [...usersWithAccess];
                  updated[index].permission = val;
                  setUsersWithAccess(updated);
                }}
                showSeparator={index < usersWithAccess.length - 1}
              />
            ))}
          </div>
        </div>

        {/* GENERAL ACCESS (Static for now, can be extracted if needed later) */}
        {/* <div className={styles.generalAccess}>
          <div className={styles.sectionLabel}>General access</div>
          <div className={styles.generalRow}>
            <div className={styles.generalIcon}>
              <Icon d={iconsWithPaths.users} size={16} />
            </div>
            <div className={styles.generalInfo}>
              <div className={styles.generalTitle}>
                Zuru Tech members
                <Icon d={iconsWithPaths.chevDown} size={12} />
              </div>
              <div className={styles.generalSubtitle}>
                Anyone in the org can view via the link.
              </div>
            </div>
            <div className={styles.roleSelector}>
              Viewer
              <Icon d={iconsWithPaths.chevDown} size={11} />
            </div>
          </div>
        </div> */}

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
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
