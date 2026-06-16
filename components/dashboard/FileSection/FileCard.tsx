import FileType from '@/components/ui/fileType';
import Icon from '@/components/ui/icon';
import UserAvatar from '@/components/ui/user-avatar';
import { iconsWithPaths } from '@/constants/common-constants';
import { formatFileDate, getAvatarColor } from '@/lib/utils';
import type { SessionUser } from '@/types/auth';
import type { FileKind } from '@/types/dashboard';
import type { UploadedFile } from '@/types/files';
import styles from './FileCard.module.scss';
import FileMenu from './FileMenu';

export default function FileCard({
  file,
  user,
  big = false,
}: {
  file: UploadedFile;
  user?: SessionUser;
  big?: boolean;
}) {
  const createdAt = formatFileDate(file.createdAt);
  const ownerInitials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`
    : '';

  const fileExtension = file.name.split('.')[1] as FileKind;

  return (
    <div
      className={`${styles.card} ${big ? styles.cardBig : ''}`.trim()}
      data-slot="file-card"
    >
      <div className={styles.header}>
        <FileType kind={fileExtension} />
        <div className={styles.headerActions}>
          {file.starred && (
            <Icon
              d={iconsWithPaths.star}
              size={13}
              className={styles.starIcon}
            />
          )}
          <FileMenu file={file} />
        </div>
      </div>

      <div className={styles.preview}>
        <Icon
          d={iconsWithPaths.file}
          size={big ? 30 : 24}
          className={styles.fileIcon}
        />
      </div>

      <div>
        <div className={styles.name}>{file.name}</div>
        <div className={styles.meta}>
          <div className={styles.metaLeft}>
            <UserAvatar
              initials={ownerInitials}
              tone={getAvatarColor(user?.userId ?? '')}
              size="sm"
            />
            <span className={styles.modTime}>{createdAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
