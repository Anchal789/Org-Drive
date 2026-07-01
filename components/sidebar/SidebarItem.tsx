"use client";
import { usePathname, useRouter } from "next/navigation";
import type { FunctionComponent } from "react";
import Badge from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useSidebar } from "@/components/ui/sidebar";
import styles from "./DriveSidebar.module.scss";
import type { SidebarItemProps } from "@/types/component-types";
import { Button } from "../ui/button";

const SidebarItem: FunctionComponent<{ item: SidebarItemProps }> = ({
  item,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const isActive = pathname.includes(item.url);

  return (
    <Button
      type="button"
      title={collapsed ? item.label : undefined}
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
