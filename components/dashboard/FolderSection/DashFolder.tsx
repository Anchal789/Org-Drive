import { Folder, Shield, Users } from 'lucide-react';
import type { UploadedFile, UploadedFolder } from '@/types/files';
import FileSelectionBar from '../FileSection/FileSelectionBar';
import UploadWidget from '../upload-widget/UploadWidget';
import { ActionButtons } from './ActionButtons';
import styles from './DashFolder.module.scss';
import LayoutForInsideFolder from './LayoutForInsideFolder';

export default function DashFolder({
  files,
  folderName,
  folderId,
  membersCount,
  permissions,
  folderDetails,
}: {
  files: Array<UploadedFile>;
  folderName: string;
  folderId: number;
  membersCount: number;
  permissions: string[];
  folderDetails: UploadedFolder;
}) {
  const canEdit = permissions.includes('editor');
  const canView = permissions.includes('viewer');

  return (
    <>
      <div className={styles.header}>
        <Folder size={16} className={styles.folderIcon} fill='currentColor' />
        <h6 className={styles.title}>{folderName}</h6>
      </div>
      <div className={styles.subHeader}>
        <span className={styles.subHeaderContent}>
          <Users size={13} />{' '}
          {membersCount
            ? `Shared with ${membersCount} people`
            : 'Shared with no one'}
        </span>
        {!!membersCount && (
          <span className={styles.subHeaderContent}>
            <span className={styles.divider} />
            <Shield size={13} /> Members can
            {canEdit && ' edit'} {canEdit && canView && '&'} {canView && 'view'}
          </span>
        )}
        <div className={styles.flex} />
        <ActionButtons
          folderId={folderId}
          folderName={folderName}
          folderDetails={folderDetails}
        />
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
