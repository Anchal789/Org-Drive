'use client';

import { Folder, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { FunctionComponent } from 'react';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/user-avatar';
import { TINTS } from '@/constants/common-constants';
import { useIsTab } from '@/hooks/use-mobile';
import { getAvatarColor, getFolderTone } from '@/lib/utils';
import type { UploadedFolder } from '@/types/files';
import styles from './FolderContainer.module.scss';
import FolderMenu from './FolderMenu/FolderMenu';
import FolderTile from './FolderTile';

const getFolderToneStyle = (folder: UploadedFolder) =>
  TINTS?.[getFolderTone(folder.id)];

const FolderContainer: FunctionComponent<{
  folder: UploadedFolder;
  layout?: string;
}> = ({ folder, layout }) => {
  const router = useRouter();
  const isMobile = useIsTab();
  const folderId = folder.id;
  const encodedFolderName = encodeURIComponent(folder.name);

  const ownerInitials = folder
    ? `${folder.ownerFirstName?.charAt(0) ?? ''}${folder.ownerLastName?.charAt(0) ?? ''}`
    : '';

  if (isMobile) {
    return (
      <div key={folder.name} className={styles.folderCard}>
        <Button
          type='button'
          aria-label={`Open ${folder.name}`}
          className={styles.clickOverlay}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (
              target.closest('[role="dialog"]') ||
              target.closest('[data-slot="dialog-content"]')
            ) {
              return;
            }

            router.push(
              `/my-drive/folder?folderId=${folderId}&folderName=${encodedFolderName}`,
            );
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              router.push(
                `/my-drive/folder?folderId=${folderId}&folderName=${encodedFolderName}`,
              );
            }
          }}
        />
        <div className={styles.folderHeaderSm}>
          <Folder
            size={22}
            color={getFolderToneStyle(folder)?.bg}
            fill={getFolderToneStyle(folder)?.bg}
          />
          {folder.bookmark && <Tag size={13} className={styles.starIcon} />}
        </div>
        <div className={styles.folderName}>{folder.name}</div>
        <div className={styles.folderActions}>
          <div className={styles.folderCount}>{folder?.fileCount} files</div>
          <div className={styles.folderMenu}>
            <UserAvatar
              initials={ownerInitials}
              tone={getAvatarColor(folder?.userId ?? '')}
              size='sm'
            />
            <FolderMenu folder={folder} />
          </div>
        </div>
      </div>
    );
  }

  if (layout === 'grid')
    return (
      <div className={styles.folderContainer}>
        <Button
          type='button'
          aria-label={`Open ${folder.name}`}
          className={styles.clickOverlay}
          onClick={(e) => {
            const target = e.target as HTMLElement;

            if (
              target.closest('[role="dialog"]') ||
              target.closest('[data-slot="dialog-content"]')
            ) {
              return;
            }

            router.push(
              `/my-drive/folder?folderId=${folderId}&folderName=${encodedFolderName}`,
            );
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              router.push(
                `/my-drive/folder?folderId=${folderId}&folderName=${encodedFolderName}`,
              );
            }
          }}
        />
        <FolderTile folder={folder} />
      </div>
    );

  if (layout === 'list')
    return (
      <div className={styles.folderContainer}>
        <Button
          type='button'
          aria-label={`Open ${folder.name}`}
          className={styles.clickOverlay}
          onClick={(e) => {
            const target = e.target as HTMLElement;

            if (
              target.closest('[role="dialog"]') ||
              target.closest('[data-slot="dialog-content"]')
            ) {
              return;
            }
            router.push(
              `/my-drive/folder?folderId=${folderId}&folderName=${encodedFolderName}`,
            );
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              router.push(
                `/my-drive/folder?folderId=${folderId}&folderName=${encodedFolderName}`,
              );
            }
          }}
        />
        <div key={folder.name} className={styles.folderChip}>
          <div className={styles.folderInfo}>
            <Folder
              size={14}
              color={getFolderToneStyle(folder)?.bg}
              fill={getFolderToneStyle(folder)?.bg}
            />
            <span className={styles.folderName}>{folder.name}</span>
          </div>
          <div className={styles.folderActions}>
            {folder.bookmark && <Tag size={13} className={styles.starIcon} />}
            <UserAvatar
              initials={ownerInitials}
              tone={getAvatarColor(folder?.userId ?? '')}
              size='sm'
            />
            <FolderMenu folder={folder} />
          </div>
        </div>
      </div>
    );
};

export default FolderContainer;
