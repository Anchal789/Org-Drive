import UserAvatar from "@/components/ui/user-avatar";
import { getAvatarColor } from "@/lib/utils";
import type { User } from "@/types/auth";
import { InputGroupAddon } from "@/components/ui/input-group";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import styles from "./ShareDialog.module.scss";
import { Users } from "lucide-react";

interface UserSearchBoxProps {
  filteredUsers: User[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSelectUsers: (users: User[]) => void;
}
const getInitials = (first?: string, last?: string) =>
  `${first?.charAt(0) ?? ""}${last?.charAt(0) ?? ""}`;

const userToStringLabel = (u: User) =>
  `${u.firstName || ""} ${u.lastName || ""}`;

const userToStringValue = (u: User) => String(u.id);

export default function UserSearchBox({
  filteredUsers,
  searchTerm,
  setSearchTerm,
  onSelectUsers,
}: UserSearchBoxProps) {
  return (
    <Combobox
      items={filteredUsers}
      itemToStringLabel={userToStringLabel}
      itemToStringValue={userToStringValue}
      onValueChange={(value: User | User[]) => {
        const selectedUsers = Array.isArray(value) ? value : [value];
        onSelectUsers(selectedUsers);
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
          <Users size={14} />
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
                initials={getInitials(
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
  );
}
