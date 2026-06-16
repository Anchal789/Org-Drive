import type { FunctionComponent } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import FileType from '@/components/ui/fileType';
import Icon from '@/components/ui/icon';
import UserAvatar from '@/components/ui/user-avatar';
import { iconsWithPaths, TINTS } from '@/constants/common-constants';
import { formatFileDate, getAvatarColor } from '@/lib/utils';
import { formatBytes } from '@/store/store';
import type { SessionUser } from '@/types/auth';
import type { FileKind } from '@/types/dashboard';
import type { UploadedFile } from '@/types/files';
import FileMenu from '../FileSection/FileMenu';
import styles from './DashList.module.scss';

const FileTable: FunctionComponent<{
  files: UploadedFile[];
  user: SessionUser;
}> = ({ files, user }) => {
  const fileExtension = (file: UploadedFile) =>
    file.name.split('.')[1] as FileKind;
  const createdAt = (file: UploadedFile) => formatFileDate(file.createdAt);
  const ownerInitials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`
    : '';
  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        <span>
          <Checkbox checked={false} />
        </span>
        <span className={styles.sortable}>
          Name <Icon d={iconsWithPaths.chevDown} size={10} />
        </span>
        <span>Type</span>
        <span>Owner</span>
        <span>Modified</span>
        <span>Size</span>
        <span />
      </div>
      {files.map((file, i) => (
        <div
          key={file.id}
          className={`${styles.tableRow} ${i === files.length - 1 ? styles.tableRowLast : ''}`}
        >
          <Checkbox checked={false} />
          <div className={styles.fileCell}>
            <FileType kind={fileExtension(file)} />
            <span className={styles.fileName}>{file.name}</span>
            {file.starred && (
              <Icon
                d={iconsWithPaths.star}
                size={12}
                style={{
                  color: TINTS.amber.bd,
                  fill: TINTS.amber.bg,
                }}
              />
            )}
          </div>
          <span className={styles.kindCell}>{fileExtension(file)}</span>
          <div className={styles.ownerCell}>
            <UserAvatar
              initials={ownerInitials}
              tone={getAvatarColor(user?.userId ?? '')}
              size="sm"
            />
            <span className={styles.ownerName} />
          </div>
          <span className={styles.metaCell}>{createdAt(file)}</span>
          <span className={styles.metaCell}>{formatBytes(file.size)}</span>
          <FileMenu file={file} />
        </div>
      ))}
    </div>
  );
};

export default FileTable;
