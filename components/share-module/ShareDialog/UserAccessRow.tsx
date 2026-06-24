import UserAvatar from "@/components/ui/user-avatar";
import { getAvatarColor } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import styles from "./ShareDialog.module.scss";

interface UserAccessRowProps {
  user: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    photoUrl?: string | null;
  };
  permission: string;
  isOwner?: boolean;
  isCurrentUser?: boolean;
  disabled?: boolean;
  hideOwnerOption?: boolean;
  onPermissionChange?: (
    value: "viewer" | "editor" | "owner" | "commenter",
  ) => void;
  showSeparator?: boolean;
}

export default function UserAccessRow({
  user,
  permission,
  isOwner = false,
  isCurrentUser = false,
  disabled = false,
  hideOwnerOption = false,
  onPermissionChange,
  showSeparator = true,
}: UserAccessRowProps) {
  const initials = `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`;

  return (
    <>
      <div className={styles.personRow}>
        <UserAvatar
          src={user.photoUrl ?? "https://github.com/shadcn.png"}
          initials={initials}
          tone={getAvatarColor(String(user.id))}
          size="default"
        />
        <div className={styles.personInfo}>
          <div className={styles.personName}>
            {user.firstName} {user.lastName}
            {isCurrentUser && <span className={styles.youTag}>(you)</span>}
          </div>
          <div className={styles.personUserName}>
            {user.username ? `@${user.username}` : ""}
          </div>
        </div>
        <Select
          defaultValue={isOwner ? "owner" : permission?.toLowerCase()}
          onValueChange={onPermissionChange}
          disabled={disabled || isOwner}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Role</SelectLabel>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              {!hideOwnerOption && (
                <SelectItem value="owner" disabled>
                  Owner
                </SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {showSeparator && <Separator />}
    </>
  );
}
