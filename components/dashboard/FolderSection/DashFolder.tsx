import { Folder, Share, Shield, Users } from 'lucide-react';
import type { UploadedFile } from '@/types/files';
import DriveCrumb from '../DriveCrumb/DriveCrumb';
import FileSelectionBar from '../FileSection/FileSelectionBar';
import UploadWidget from '../upload-widget/UploadWidget';
import styles from './DashFolder.module.scss';
import { DownloadAllButton } from './DownloadAllButton';
import LayoutForInsideFolder from './LayoutForInsideFolder';
import { Button } from '@/components/ui/button';

export default function DashFolder({
  files,
  folderName,
  folderId,
  membersCount,
  permissions,
}: {
  files: Array<UploadedFile>;
  folderName: string;
  folderId: number;
  membersCount: number;
  permissions: string[];
}) {
  const canEdit = permissions.includes('editor');
  const canView = permissions.includes('viewer');

  return (
    <>
      <DriveCrumb inFolder={folderName ?? 'Folder name'} />

      <div className={styles.subHeader}>
        <Users size={13} />{' '}
        {membersCount
          ? `Shared with ${membersCount} people`
          : 'Shared with no one'}
        {!!membersCount && (
          <>
            <span className={styles.divider} />
            <Shield size={13} /> Members can
            {canEdit && ' edit'} {canEdit && canView && '&'} {canView && 'view'}
          </>
        )}
        <div className={styles.flex} />
        <Button variant='ghost'>
          <Share size={13} />
          Share
        </Button>
        <DownloadAllButton folderId={folderId} folderName={folderName} />
      </div>

      <div className={styles.content}>
        {/* Flat folder hint */}
        <div className={styles.flatHint}>
          <Folder size={14} className={styles.flatHintIcon} />
          <span className={styles.flatHintText}>
            <strong>Flat folder.</strong> Org Drive keeps things simple: folders
            contain files, not other folders. Use tags for finer organization.
          </span>
          <span className={styles.flatHintAction}>About this</span>
        </div>

        <FileSelectionBar files={files} />
        <LayoutForInsideFolder files={files} />
      </div>

      <UploadWidget />
    </>
  );
}
