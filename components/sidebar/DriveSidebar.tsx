import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { getSessionUser } from '@/lib/session';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.respository';
import type { SidebarItemProps } from '@/types/component-types';
import styles from './DriveSidebar.module.scss';
import NewItemButton from './NewItemButton';
import { OrgPill } from './OrgPill';
import { StorageCard } from './SidebarFooter';
import SidebarItem from './SidebarItem';
import { SidebarSection } from './SidebarSection';
import { SidebarToggleButton } from './SidebarToggleButton';

const OPTIONAL_ITEMS: SidebarItemProps[] = [
  {
    icon: 'Sparkle',
    label: 'AI chat',
    badge: 'Beta',
    url: '/ai-chat',
  },
  { icon: 'Search', label: 'Smart search', url: '/smart-search' },
];

const ADMIN_ITEMS: SidebarItemProps[] = [
  { icon: 'Activity', label: 'Analytics', url: '/analytics' },
  { icon: 'Settings', label: 'Settings', url: '/settings' },
];

export default async function DriveSidebar({
  fileFolderCount,
  sharedWithMeFileCount,
  bookmarksCount,
}: {
  fileFolderCount: number;
  sharedWithMeFileCount: number;
  bookmarksCount: number;
}) {
  const user = await getSessionUser();
  const filesize = await uploadedFilesRepository.totalStorage(
    Number(user?.userId),
  );
  const totalSize = filesize.reduce((a, b) => a + b.size, 0);

  const MAIN_ITEMS: SidebarItemProps[] = [
    {
      icon: 'Cloud',
      label: 'My drive',
      count: fileFolderCount,
      url: '/my-drive',
    },
    {
      icon: 'Users',
      label: 'Shared with me',
      count: sharedWithMeFileCount,
      url: '/shared-with-me',
    },
    { icon: 'Clock', label: 'Recent', url: '/recent' },
    {
      icon: 'Tag',
      label: 'Bookmark',
      count: bookmarksCount,
      url: '/bookmark',
    },
    { icon: 'Trash2', label: 'Trash', url: '/trash' },
  ];

  return (
    <Sidebar collapsible='icon' className={styles.sidebar}>
      {/* 1. Wrap top elements in SidebarHeader */}
      <SidebarHeader className={styles.sidebarHeader}>
        <SidebarToggleButton />
        <OrgPill />
        <NewItemButton />
      </SidebarHeader>

      {/* 2. Content wrapper stays the same */}
      <SidebarContent className={styles.contentReset}>
        <nav className={styles.nav}>
          {MAIN_ITEMS.map((item) => (
            <SidebarItem key={item.label} item={item} />
          ))}
        </nav>

        <SidebarSection label='AI (optional)' items={OPTIONAL_ITEMS} />
        <SidebarSection label='Admin' items={ADMIN_ITEMS} />
      </SidebarContent>

      {/* 3. Wrap bottom elements in SidebarFooter */}
      <SidebarFooter className={styles.footerReset}>
        <StorageCard totalSize={totalSize} />
      </SidebarFooter>
    </Sidebar>
  );
}
