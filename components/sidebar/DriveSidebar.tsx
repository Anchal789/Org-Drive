import Icon from '@/components/ui/icon';
import Ring from '@/components/ui/Ring';
import { iconsWithPaths } from '@/constants/common-constants';
import { getSessionUser } from '@/lib/session';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.respository';
import { formatBytes } from '@/store/store';
import styles from '@/styles/components/DriveSidebar.module.scss';
import type {
  DriveSidebarProps,
  SidebarItemProps,
} from '@/types/component-types';
import NewItemButton from './NewItemButton';
import SidebarItem from './SidebarItem';

const MAIN_ITEMS: SidebarItemProps[] = [
  {
    icon: iconsWithPaths.cloud,
    label: 'My drive',
    count: 248,
    url: '/my-drive',
  },
  {
    icon: iconsWithPaths.users,
    label: 'Shared with me',
    count: 31,
    url: '/shared-with-me',
  },
  { icon: iconsWithPaths.clock, label: 'Recent', url: '/recent' },
  { icon: iconsWithPaths.star, label: 'Starred', count: 8, url: '/starred' },
  { icon: iconsWithPaths.trash, label: 'Trash', url: '/trash' },
];

const OPTIONAL_ITEMS: SidebarItemProps[] = [
  {
    icon: iconsWithPaths.sparkle,
    label: 'AI chat',
    badge: 'Beta',
    url: '/ai-chat',
  },
  { icon: iconsWithPaths.search, label: 'Smart search', url: '/smart-search' },
];

const ADMIN_ITEMS: SidebarItemProps[] = [
  { icon: iconsWithPaths.activity, label: 'Analytics', url: '/analytics' },
  { icon: iconsWithPaths.settings, label: 'Settings', url: '/settings' },
];

export default async function DriveSidebar({
  collapsed = false,
}: DriveSidebarProps) {
  const user = await getSessionUser();

  const renderItem = (item: SidebarItemProps) => {
    return <SidebarItem key={item.label} item={item} collapsed={collapsed} />;
  };

  const filesize = await uploadedFilesRepository.totalStorage(
    Number(user?.userId),
  );
  const totalSize = filesize.reduce((a, b) => a + b.size, 0);

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
      style={{ width: collapsed ? 64 : 232 }}
    >
      {/* Org pill */}
      <button type="button" className={styles.orgPill}>
        <div className={styles.orgLogo}>Z</div>
        {!collapsed && (
          <>
            <span className={styles.orgName}>Zuru Tech</span>
            <Icon d={iconsWithPaths.chevDown} size={12} />
          </>
        )}
      </button>

      {/* + New button */}
      <NewItemButton collapsed={collapsed} />

      <nav className={styles.nav}>{MAIN_ITEMS.map(renderItem)}</nav>

      {!collapsed && (
        <>
          <div className={styles.sectionLabel}>AI (optional)</div>
          <nav className={styles.nav}>{OPTIONAL_ITEMS.map(renderItem)}</nav>

          <div className={styles.sectionLabel}>Admin</div>
          <nav className={styles.nav}>{ADMIN_ITEMS.map(renderItem)}</nav>
        </>
      )}

      <div className={styles.spacer} />

      {/* Storage ring */}
      {!collapsed && (
        <div className={styles.storage}>
          <Ring pct={64} size={44} color="var(--primary)" />
          <div className={styles.storageInfo}>
            <div className={styles.storageLabel}>Telegram channel</div>
            <div className={styles.storageUsed}>
              {formatBytes(totalSize)} used
            </div>
            <div className={styles.storageCap}>of effectively ∞</div>
          </div>
        </div>
      )}
    </aside>
  );
}
