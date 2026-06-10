"use client";

import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import styles from "@/styles/components/DriveSidebar.module.scss";
import { SidebarItemProps } from "@/types/component-types";
import { FunctionComponent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";

const SidebarItem: FunctionComponent<{
  item: SidebarItemProps;
  collapsed: boolean;
}> = ({ item, collapsed }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = item.url === pathname;
  return (
    <Button
      key={item.label}
      type="button"
      className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
      onClick={() => router.push(item.url)}
    >
      <Icon d={item.icon} size={16} />
      {!collapsed && <span className={styles.navItemLabel}>{item.label}</span>}
      {!collapsed && item.count != null && (
        <span className={styles.navItemCount}>{item.count}</span>
      )}
      {!collapsed && item.badge && (
        <Badge tone="violet" style={{ padding: "1px 6px", fontSize: 9 }}>
          {item.badge}
        </Badge>
      )}
    </Button>
  );
};

export default SidebarItem;
