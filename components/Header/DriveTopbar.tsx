import Badge from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import UserAvatar from '@/components/ui/user-avatar';
import { iconsWithPaths } from '@/constants/common-constants';
import type { SessionUser } from '@/types/auth';
import styles from './DriveTopbar.module.scss';

export default function DriveTopbar({ user }: { user: SessionUser }) {
  const userInitials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`
    : '';

  return (
    <div className={styles.topbar}>
      <div className={styles.searchBox}>
        <Icon d={iconsWithPaths.search} size={16} className={styles.icon} />
        <span className={styles.searchPlaceholder}>Search in Org Drive</span>
        <Badge tone="violet" outline className={styles.badge}>
          <Icon d={iconsWithPaths.sparkle} size={9} /> Smart
        </Badge>
        <Icon d={iconsWithPaths.settings} size={14} className={styles.icon} />
      </div>
      <div className={styles.spacer} />
      <Icon d={iconsWithPaths.bell} size={18} className={styles.icon} />
      <UserAvatar initials={userInitials} tone="violet" size="default" ring />
    </div>
  );
}
