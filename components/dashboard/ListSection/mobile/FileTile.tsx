import { Tag } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import FileType from '@/components/ui/fileType';
import UserAvatar from '@/components/ui/user-avatar';
import { formatFileDate, getAvatarColor } from '@/lib/utils';
import type { FileKind } from '@/types/dashboard';
import type { UploadedFile } from '@/types/files';
import FileMenu from '../../FileSection/FileMenu';
import styles from './FileTile.module.scss';

const FileTile: FunctionComponent<{
  file: UploadedFile;
  isSelected?: boolean;
}> = ({ file, isSelected }) => {
  const createdAt = formatFileDate(file.createdAt);
  const ownerInitials = file
    ? `${file.ownerFirstName?.charAt(0) ?? ''}${file.ownerLastName?.charAt(0) ?? ''}`
    : '';

  const fileExtension = file.name.split('.')[1] as FileKind;
  const metaText = `${createdAt}`;

  return (
    <div
      className={`${styles.tile} ${isSelected ? styles.selected : ''}`.trim()}
    >
      <div className={styles.interactiveZone}>
        {isSelected ? (
          <Checkbox checked={isSelected} size='21.39px' />
        ) : (
          <FileType kind={fileExtension} />
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.name}>{file.name}</div>
        <div className={styles.meta}>{metaText}</div>
      </div>

      <div className={styles.actions}>
        {file.bookmark && <Tag size={13} className={styles.starIcon} />}

        <UserAvatar
          initials={ownerInitials}
          tone={getAvatarColor(file?.userId ?? '')}
          size='sm'
        />

        <FileMenu file={file} />
      </div>
    </div>
  );
};

export default FileTile;
