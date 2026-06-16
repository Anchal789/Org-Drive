export const dynamic = 'force-dynamic';

import Btn from '@/components/ui/btn';
import Icon from '@/components/ui/icon';
import { iconsWithPaths } from '@/constants/common-constants';
import type { SessionUser } from '@/types/auth';
import type { UploadedFile } from '@/types/files';
import DriveTopbar from '../../Header/DriveTopbar';
import DriveCrumb from '../DriveCrumb/DriveCrumb';
import FileCard from '../FileSection/FileCard';
import UploadWidget from '../UploadWidget';
import styles from './DashFolder.module.scss';
import { DownloadAllButton } from './DownloadAllButton';

export default function DashFolder({
  files,
  folderName,
  folderId,
  user,
}: {
  files: Array<UploadedFile>;
  folderName: string;
  folderId: number;
  user: SessionUser;
}) {
  return (
    <div className={styles.shell} data-screen-label="02 Drive · Inside folder">
      <div className={styles.main}>
        <DriveTopbar user={user} />
        <DriveCrumb inFolder={folderName ?? 'Folder name'} />

        <div className={styles.subHeader}>
          <Icon d={iconsWithPaths.users} size={13} /> Shared with 4 people
          <span className={styles.divider} />
          <Icon d={iconsWithPaths.shield} size={13} /> Members can edit
          <div className={styles.flex} />
          <Btn variant="ghost" size="sm" icon={iconsWithPaths.share}>
            Share
          </Btn>
          <DownloadAllButton folderId={folderId} folderName={folderName} />
        </div>

        <div className={styles.content}>
          {/* Flat folder hint */}
          <div className={styles.flatHint}>
            <Icon
              d={iconsWithPaths.folder}
              size={14}
              className={styles.flatHintIcon}
            />
            <span className={styles.flatHintText}>
              <strong>Flat folder.</strong> Org Drive keeps things simple —
              folders contain files, not other folders. Use tags for finer
              organization.
            </span>
            <span className={styles.flatHintAction}>About this</span>
          </div>

          {/* Files grid */}
          <div className={styles.filesGrid}>
            {files.slice(0, 10).map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </div>

        <UploadWidget />
      </div>
    </div>
  );
}
