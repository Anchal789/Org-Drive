"use client";
import Icon from "@/components/ui/icon";
import { iconsWithPaths } from "@/constants/common-constants";
import { useDragDropStore } from "@/store/store";
import { useSidebar } from "@/components/ui/sidebar";
import styles from "./DriveSidebar.module.scss";
import { Button } from "../ui/button";

export default function NewItemButton() {
  const { isDragging, setIsDragging } = useDragDropStore();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <Button
      type="button"
      className={`${styles.newButton} ${collapsed ? styles.newButtonCollapsed : ""}`}
      onClick={() => setIsDragging(!isDragging)}
    >
      <Icon d={iconsWithPaths.plus} size={16} stroke={2.2} />
      {!collapsed && <span>New</span>}
    </Button>
  );
}
