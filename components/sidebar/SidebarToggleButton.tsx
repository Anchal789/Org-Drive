"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import styles from "./Sidebar.module.scss";
import { Button } from "../ui/button";

export function SidebarToggleButton() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={toggleSidebar}
      className={styles.sidebarToggleButton}
    >
      {collapsed ? (
        <ChevronRightIcon size={14} />
      ) : (
        <ChevronLeftIcon size={14} />
      )}
    </Button>
  );
}
