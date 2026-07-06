import { Folder, Tag } from 'lucide-react';
import UserAvatar from '@/components/ui/user-avatar';
import { TINTS } from '@/constants/common-constants';
import { getAvatarColor, getFolderTone } from '@/lib/utils';
import type { UploadedFolder } from '@/types/files';
import FolderMenu from './FolderMenu/FolderMenu';
import styles from './FolderTile.module.scss';

export default function FolderTile({
  folder,
  active = false,
}: {
  folder: UploadedFolder;
  active?: boolean;
}) {
  const tint = TINTS[getFolderTone(folder.id)];
  const ownerInitials = folder
    ? `${folder.ownerFirstName?.charAt(0) ?? ''}${folder.ownerLastName?.charAt(0) ?? ''}`
    : '';

  return (
    <div
      className={`${styles.tile} ${active ? styles.tileActive : ''}`}
      data-slot='folder-tile'
    >
      <div
        className={styles.iconBox}
        style={{ background: tint?.bg, color: tint?.tx }}
      >
        <Folder size={16} fill='currentColor' />
      </div>
      <div className={styles.body}>
        <div className={styles.name}>{folder.name}</div>
        <div className={styles.count}>{folder.fileCount} files</div>
      </div>
      {folder.bookmark && <Tag size={13} className={styles.starIcon} />}
      <UserAvatar
        initials={ownerInitials}
        tone={getAvatarColor(folder?.userId ?? '')}
        size='sm'
      />
      <FolderMenu folder={folder} />
    </div>
  );
}
