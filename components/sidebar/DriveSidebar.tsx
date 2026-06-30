import { iconsWithPaths } from "@/constants/common-constants";
import { getSessionUser } from "@/lib/session";
import { uploadedFilesRepository } from "@/repositories/uploaded-files.respository";
import styles from "./DriveSidebar.module.scss";
import type { SidebarItemProps } from "@/types/component-types";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import NewItemButton from "./NewItemButton";
import SidebarItem from "./SidebarItem";
import { OrgPill } from "./OrgPill";
import { SidebarSection } from "./SidebarSection";
import { StorageCard } from "./SidebarFooter";
import { SidebarToggleButton } from "./SidebarToggleButton";

const MAIN_ITEMS: SidebarItemProps[] = [
  {
    icon: iconsWithPaths.cloud,
    label: "My drive",
    count: 248,
    url: "/my-drive",
  },
  {
    icon: iconsWithPaths.users,
    label: "Shared with me",
    count: 31,
    url: "/shared-with-me",
  },
  { icon: iconsWithPaths.clock, label: "Recent", url: "/recent" },
  {
    icon: iconsWithPaths.bookmark,
    label: "Bookmark",
    count: 8,
    url: "/bookmark",
  },
  { icon: iconsWithPaths.trash, label: "Trash", url: "/trash" },
];

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

export default async function DriveSidebar() {
  const user = await getSessionUser();
  const filesize = await uploadedFilesRepository.totalStorage(
    Number(user?.userId),
  );
  const totalSize = filesize.reduce((a, b) => a + b.size, 0);

  return (
    <Sidebar collapsible="icon" className={styles.sidebar}>
      <SidebarToggleButton />
      <OrgPill />
      <NewItemButton />
      <SidebarContent className={styles.contentReset}>
        <nav className={styles.nav}>
          {MAIN_ITEMS.map((item) => (
            <SidebarItem key={item.label} item={item} />
          ))}
        </nav>

        <SidebarSection label="AI (optional)" items={OPTIONAL_ITEMS} />
        <SidebarSection label="Admin" items={ADMIN_ITEMS} />
      </SidebarContent>
      <StorageCard totalSize={totalSize} />
    </Sidebar>
  );
}
