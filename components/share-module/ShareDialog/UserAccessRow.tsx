import { toast } from 'sonner'; // <-- Import toast
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import UserAvatar from '@/components/ui/user-avatar';
import { getAvatarColor } from '@/lib/utils';
import { userRemoveAccess } from '@/services/shared-with-me-service';
import RemoveAccess from './RemoveAccess';
import styles from './ShareDialog.module.scss';

interface UserAccessRowProps {
  user: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    photoUrl?: string | null;
  } & {
    shareId: number;
  };
  permission: string;
  isOwner?: boolean;
  isCurrentUser?: boolean;
  disabled?: boolean;
  hideOwnerOption?: boolean;
  onPermissionChange?: (
    value: 'viewer' | 'editor' | 'owner' | 'commenter',
  ) => void;
  showSeparator?: boolean;
  onRemoveSuccess?: (userId: number) => void;
}

export default function UserAccessRow({
  user,
  permission,
  isOwner = false,
  isCurrentUser = false,
  disabled = false,
  onPermissionChange,
  showSeparator = true,
  onRemoveSuccess,
}: UserAccessRowProps) {
  const initials = `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`;

  const removeAccess = async () => {
    try {
      await userRemoveAccess(user.shareId);
      toast.success('Access removed successfully');

      if (onRemoveSuccess) {
        onRemoveSuccess(user.id);
      }
    } catch {
      toast.error('Failed to remove access');
    }
  };

  return (
    <>
      <div className={styles.personRow}>
        <UserAvatar
          src={user.photoUrl ?? 'https://github.com/shadcn.png'}
          initials={initials}
          tone={getAvatarColor(String(user.id))}
          size='default'
        />
        <div className={styles.personInfo}>
          <div className={styles.personName}>
            {user.firstName} {user.lastName}
            {isCurrentUser && <span className={styles.youTag}>(you)</span>}
          </div>
          <div className={styles.personUserName}>
            {user.username ? `@${user.username}` : ''}
          </div>
        </div>
        <div className={styles.personActions}>
          <Select
            defaultValue={isOwner ? 'owner' : permission?.toLowerCase()}
            onValueChange={onPermissionChange}
            disabled={disabled || isOwner}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select a role' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Role</SelectLabel>
                <SelectItem value='viewer'>Viewer</SelectItem>
                <SelectItem value='editor'>Editor</SelectItem>
                <SelectItem value='owner' disabled>
                  Owner
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {!(disabled || isOwner || !onRemoveSuccess) && (
            <RemoveAccess removeAccess={removeAccess} />
          )}
        </div>
      </div>
      {showSeparator && <Separator />}
    </>
  );
}
