"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import FileType from "@/components/ui/fileType";
import Icon from "@/components/ui/icon";
import UserAvatar from "@/components/ui/user-avatar";
import { iconsWithPaths } from "@/constants/common-constants";
import { fetchFolderFromFile } from "@/lib/share";
import { useShareDialogStore } from "@/store/store";
import styles from "./ShareDialog.module.scss";
import { FileKind } from "@/types/dashboard";
import { ShareWithMePerson } from "@/types/share-with-me";
import { User } from "@/types/auth";
import { useDebounce } from "@/hooks/use-debounce";
import { getAvatarColor } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { InputGroupAddon } from "../../ui/input-group";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { getUsersWithAccessAction } from "@/actions/share-actions";
import { Separator } from "@/components/ui/separator";
import { postData } from "@/lib/api-fn";
import { toast } from "sonner";

export default function ShareDialog({
  userId,
  allUsers,
}: {
  userId: number;
  allUsers: Array<User>;
}) {
  const { open, setOpen, file, folder } = useShareDialogStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [folderName, setFolderName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [usersWithAccess, setUsersWithAccess] = useState<ShareWithMePerson[]>(
    [],
  );
  const [usersToInvite, setUsersToInvite] = useState<
    Array<User & { permission: "viewer" | "editor" | "owner" | "commenter" }>
  >([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (open && file?.folderId) {
      setIsLoading(true);
      const folderName = async () => {
        try {
          const result = await fetchFolderFromFile(
            Number(file.userId),
            Number(file.folderId),
          );
          setFolderName(result?.name ?? null);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      folderName();
    }
  }, [open, file]);

  useEffect(() => {
    if (!open || !file) return;

    const fetchusersWithAccess = async () => {
      const result = await getUsersWithAccessAction(file.id, file.userId);
      setUsersWithAccess(result);
    };
    fetchusersWithAccess();
  }, [open, file]);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setFolderName(null);
      setIsLoading(false);
      setUsersWithAccess([]);
      setUsersToInvite([]);
    }
  }, [open]);

  const filteredUsers = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return [];

    const lowerTerm = debouncedSearchTerm.toLowerCase();

    return allUsers.filter((user) => {
      // Exclude the current logged-in user
      if (user.id === userId) return false;

      // Exclude users who ALREADY have access
      const alreadyHasAccess = usersWithAccess.some((wa) => wa.id === user.id);
      if (alreadyHasAccess) return false;

      const fullName =
        `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      const userName = (user.username || "").toLowerCase();

      return fullName.includes(lowerTerm) || userName.includes(lowerTerm);
    });
  }, [debouncedSearchTerm, allUsers, usersWithAccess, userId]);

  const fileExtension = file?.name?.split(".")?.[1] as FileKind;
  const initials = (firstName?: string, lastName?: string) =>
    `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`;

  const handleInviteUser = async () => {
    const invitedUserWithPermission = usersToInvite.map((user) => ({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      permission: user.permission,
    }));
    try {
      const response = await postData({
        url: "/api/share",
        payload: {
          usersToInvite: invitedUserWithPermission,
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
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error(error);
      toast.error(errMsg || "Something went wrong");
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.dialog}>
        {/* HEADER */}
        <div className={styles.header}>
          <FileType kind={fileExtension} />
          <div className={styles.headerInfo}>
            <div className={styles.headerTitle}>
              Share &quot;{file?.name}&quot;
            </div>
            <div className={styles.headerSubtitle}>
              {file?.folderId
                ? isLoading
                  ? "Loading folder..."
                  : `Inside Folder: ${folderName}`
                : "Standalone File"}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            <Icon d={iconsWithPaths.x} size={16} />
          </Button>
        </div>

        {/* SEARCH INPUT */}
        <Combobox
          items={filteredUsers}
          itemToStringLabel={(u: User) =>
            `${u.firstName || ""} ${u.lastName || ""}`
          }
          itemToStringValue={(u: User) => String(u.id)}
          onValueChange={(value: User | User[]) => {
            const selectedUsers = Array.isArray(value) ? value : [value];
            setUsersToInvite(
              selectedUsers.map((user) => ({
                ...user,
                permission: "viewer",
              })),
            );
          }}
          multiple
        >
          <ComboboxInput
            placeholder="Search people by name or @telegram-handle"
            showTrigger={false}
            className={styles.invite}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <InputGroupAddon>
              <Icon d={iconsWithPaths.users} size={14} />
            </InputGroupAddon>
          </ComboboxInput>
          <ComboboxContent className={styles.comboboxContent}>
            <ComboboxEmpty className={styles.comboboxEmpty}>
              No members matching criteria found.
            </ComboboxEmpty>

            <ComboboxList className={styles.comboboxList}>
              {(user: User) => (
                <ComboboxItem
                  key={user.id}
                  value={user}
                  className={styles.comboboxUserRow}
                >
                  <UserAvatar
                    initials={initials(
                      user.firstName ?? "",
                      user.lastName ?? "",
                    )}
                    src={user.photoUrl ?? undefined}
                    tone={getAvatarColor(String(user.id))}
                    size="sm"
                  />
                  <div className={styles.comboboxUserDetails}>
                    <span className={styles.comboboxUserName}>
                      {user.firstName} {user.lastName}
                    </span>
                    {user.username && (
                      <span className={styles.comboboxUserHandle}>
                        @{user.username}
                      </span>
                    )}
                  </div>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        {/* USERS TO INVITE SECTION */}
        {usersToInvite && usersToInvite.length > 0 && (
          <div>
            <div className={styles.sectionLabel}>Invite people</div>
            <div className={styles.personsWithAccess}>
              {usersToInvite?.map((person, index) => {
                return (
                  <div key={`invite-${person.id}`}>
                    <div className={styles.personRow}>
                      <UserAvatar
                        src={"https://github.com/shadcn.png"}
                        initials={initials(
                          person.firstName ?? "",
                          person.lastName ?? "",
                        )}
                        tone={getAvatarColor(String(person.id))}
                        size="default"
                      />
                      <div className={styles.personInfo}>
                        <div className={styles.personName}>
                          {person.firstName} {person.lastName}
                        </div>
                        <div className={styles.personUserName}>
                          {person.username ? `@${person.username}` : ""}
                        </div>
                      </div>
                      <Select
                        defaultValue={"viewer"}
                        onValueChange={(
                          value: "viewer" | "editor" | "owner" | "commenter",
                        ) => {
                          const updatedUsersToInvite = [...usersToInvite];
                          updatedUsersToInvite[index] = {
                            ...updatedUsersToInvite[index],
                            permission: value,
                          };
                          setUsersToInvite(updatedUsersToInvite);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Role</SelectLabel>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    {index < usersToInvite.length - 1 && <Separator />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PEOPLE WITH ACCESS SECTION */}
        <div>
          <div className={styles.sectionLabel}>People with access</div>
          <div className={styles.personsWithAccess}>
            {usersWithAccess?.map((person, index) => {
              const isOwner = person.permission?.toLowerCase() === "owner";
              return (
                <div key={`access-${person.id}`}>
                  <div className={styles.personRow}>
                    <UserAvatar
                      src={"https://github.com/shadcn.png"}
                      initials={initials(person.firstName, person.lastName)}
                      tone={getAvatarColor(file?.userId ?? "")}
                      size="default"
                    />
                    <div className={styles.personInfo}>
                      <div className={styles.personName}>
                        {person.firstName} {person.lastName}
                        {person.id === userId && (
                          <span className={styles.youTag}>(you)</span>
                        )}
                      </div>
                      <div className={styles.personUserName}>
                        {person.username ? `@${person.username}` : ""}
                      </div>
                    </div>
                    <Select
                      defaultValue={
                        isOwner ? "owner" : person.permission?.toLowerCase()
                      }
                      onValueChange={(
                        value: "viewer" | "editor" | "owner" | "commenter",
                      ) => {
                        const updatedUsersWithAccess = [...usersWithAccess];
                        updatedUsersWithAccess[index] = {
                          ...updatedUsersWithAccess[index],
                          permission: value,
                        };
                        setUsersWithAccess(updatedUsersWithAccess);
                      }}
                      disabled={person.id === userId || isOwner}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Role</SelectLabel>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="owner" disabled>
                            Owner
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  {index < usersWithAccess.length - 1 && <Separator />}
                </div>
              );
            })}
          </div>
        </div>

        {/* GENERAL ACCESS */}
        <div className={styles.generalAccess}>
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
        </div>

        {/* FOOTER */}
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
