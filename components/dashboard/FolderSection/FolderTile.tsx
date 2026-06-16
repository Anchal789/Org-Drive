import Icon from '@/components/ui/icon';
import UserAvatar from '@/components/ui/user-avatar';
import { iconsWithPaths, TINTS } from '@/constants/common-constants';
import { getAvatarColor, getFolderTone } from '@/lib/utils';
import type { SessionUser } from '@/types/auth';
import type { UploadedFolder } from '@/types/files';
import styles from './FolderTile.module.scss';

export default function FolderTile({
  folder,
  active = false,
  user,
}: {
  folder: UploadedFolder;
  active?: boolean;
  user?: SessionUser;
}) {
  const tint = TINTS[getFolderTone(folder.id)];
  const ownerInitials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`
    : '';

  return (
    <div
      className={`${styles.tile} ${active ? styles.tileActive : ''}`}
      data-slot="folder-tile"
    >
      <div
        className={styles.iconBox}
        style={{ background: tint?.bg, color: tint?.tx }}
      >
        <Icon
          d={iconsWithPaths.folder}
          size={16}
          fill="currentColor"
          stroke={0}
        />
      </div>
      <div className={styles.body}>
        <div className={styles.name}>{folder.name}</div>
        <div className={styles.count}>{folder.fileCount} files</div>
      </div>
      <UserAvatar
        initials={ownerInitials}
        tone={getAvatarColor(user?.userId ?? '')}
        size="sm"
      />
    </div>
  );
}
