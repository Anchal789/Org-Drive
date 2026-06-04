"use client";

import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import styles from "@/styles/components/DriveSidebar.module.scss";
import { SidebarItemProps } from "@/types/component-types";
import { FunctionComponent } from "react";
import { useRouter } from "next/navigation";

const SidebarItem: FunctionComponent<{
  item: SidebarItemProps;
  active: string;
  collapsed: boolean;
}> = ({ item, active, collapsed }) => {
  const isActive = item.label === active;
  const router = useRouter();
  return (
    <button
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
    </button>
  );
};

export default SidebarItem;
