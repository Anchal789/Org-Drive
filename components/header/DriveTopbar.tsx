import {
  Bell,
  CircleQuestionMark,
  Cloud,
  Settings,
  Shield,
  User,
} from 'lucide-react';
import UserAvatar from '@/components/ui/user-avatar';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.respository';
import { formatBytes } from '@/store/store';
import type { SessionUser } from '@/types/auth';
import SearchBar from '../dashboard/DriveCrumb/SearchBar';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { SidebarTrigger } from '../ui/sidebar';
import DarkModeBtn from './DarkModeBtn';
import DriveTopbarMobile from './DriveTopBarMobile';
import styles from './DriveTopbar.module.scss';
import LogoutBtn from './LogoutBtn';

export default async function DriveTopbar({
  user,
  isMobile,
}: {
  user: SessionUser;
  isMobile: boolean;
}) {
  const userInitials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`
    : '';

  const filesize = await uploadedFilesRepository.totalStorage(
    Number(user?.userId),
  );
  const totalSize = filesize.reduce((a, b) => a + b.size, 0);
  return (
    <div className={styles.topbar}>
      <SidebarTrigger />
      {!isMobile ? <SearchBar variant='desktop' /> : <DriveTopbarMobile />}
      <div className={styles.spacer} />
      {!isMobile && <Bell size={18} className={styles.icon} />}
      <Popover>
        <PopoverTrigger asChild>
          <UserAvatar
            initials={userInitials}
            tone='violet'
            size='default'
            className={styles.avatar}
            ring
          />
        </PopoverTrigger>

        <PopoverContent
          className={styles.popoverContent}
          align='end'
          sideOffset={6}
        >
          <div className={styles.userHandle}>
            <UserAvatar
              initials={userInitials}
              tone='violet'
              size='default'
              ring
            />
            <div className={styles.userDetails}>
              <span className={styles.name}>
                {user?.firstName} {user?.lastName}
              </span>
              <span className={styles.username}>
                {user?.username ? `@${user?.username}` : ''}
              </span>
            </div>
          </div>
          <div className={styles.workspace}>
            <div className={styles.workspaceLetter}>Z</div>
            <div className={styles.workspaceDetails}>
              <div className={styles.workspaceName}>Zuru Tech</div>
              <div className={styles.workspaceMembers}>
                Business · 0 members
              </div>
            </div>
          </div>
          <Button className={styles.actionButton}>
            <User size={16} className={styles.actionIcon} />
            <span>Profile</span>
          </Button>
          <Button className={styles.actionButton}>
            <Settings size={16} className={styles.actionIcon} />
            <span>Account settings</span>
          </Button>
          <Button className={styles.actionButton}>
            <Shield size={16} className={styles.actionIcon} />
            <span>Privacy & security</span>
          </Button>
          <Separator className={styles.separator} />
          <Button className={`${styles.actionButton} ${styles.actionAction}`}>
            <div className={styles.actionContent}>
              <Cloud size={16} className={styles.actionIcon} />
              <span>Storage</span>
            </div>
            <span className={styles.storageSize}>{formatBytes(totalSize)}</span>
          </Button>
          <DarkModeBtn />
          <Button className={styles.actionButton}>
            <CircleQuestionMark size={16} className={styles.actionIcon} />
            <span>Help & support</span>
          </Button>
          <Separator className={styles.separator} />
          <LogoutBtn user={user} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
