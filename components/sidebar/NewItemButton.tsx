"use client";
import { useDragDropStore } from "@/store/store";
import { useSidebar } from "@/components/ui/sidebar";
import styles from "./DriveSidebar.module.scss";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

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
      <Plus size={16} />
      {!collapsed && <span>New</span>}
    </Button>
  );
}
