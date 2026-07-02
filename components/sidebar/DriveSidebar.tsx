import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { iconsWithPaths } from "@/constants/common-constants";
import { getSessionUser } from "@/lib/session";
import { uploadedFilesRepository } from "@/repositories/uploaded-files.respository";
import type { SidebarItemProps } from "@/types/component-types";
import styles from "./DriveSidebar.module.scss";
import NewItemButton from "./NewItemButton";
import { OrgPill } from "./OrgPill";
import { StorageCard } from "./SidebarFooter";
import SidebarItem from "./SidebarItem";
import { SidebarSection } from "./SidebarSection";
import { SidebarToggleButton } from "./SidebarToggleButton";

const OPTIONAL_ITEMS: SidebarItemProps[] = [
  {
    icon: iconsWithPaths.sparkle,
    label: "AI chat",
    badge: "Beta",
    url: "/ai-chat",
  },
  { icon: iconsWithPaths.search, label: "Smart search", url: "/smart-search" },
];

const ADMIN_ITEMS: SidebarItemProps[] = [
  { icon: iconsWithPaths.activity, label: "Analytics", url: "/analytics" },
  { icon: iconsWithPaths.settings, label: "Settings", url: "/settings" },
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
      icon: iconsWithPaths.cloud,
      label: "My drive",
      count: fileFolderCount,
      url: "/my-drive",
    },
    {
      icon: iconsWithPaths.users,
      label: "Shared with me",
      count: sharedWithMeFileCount,
      url: "/shared-with-me",
    },
    { icon: iconsWithPaths.clock, label: "Recent", url: "/recent" },
    {
      icon: iconsWithPaths.bookmark,
      label: "Bookmark",
      count: bookmarksCount,
      url: "/bookmark",
    },
    { icon: iconsWithPaths.trash, label: "Trash", url: "/trash" },
  ];

  return (
    <Sidebar collapsible="icon" className={styles.sidebar}>
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

        <SidebarSection label="AI (optional)" items={OPTIONAL_ITEMS} />
        <SidebarSection label="Admin" items={ADMIN_ITEMS} />
      </SidebarContent>

      {/* 3. Wrap bottom elements in SidebarFooter */}
      <SidebarFooter className={styles.footerReset}>
        <StorageCard totalSize={totalSize} />
      </SidebarFooter>
    </Sidebar>
  );
}
