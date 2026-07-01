"use client";

import { Moon } from "lucide-react";
import { Switch } from "../ui/switch";
import styles from "./DriveTopbar.module.scss";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const DarkModeBtn = () => {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="size-10 rounded-md border border-gray-200 dark:border-gray-800 animate-pulse bg-gray-200 dark:bg-gray-800" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className={`${styles.actionButton} ${styles.actionAction}`}>
      <div className={styles.actionContent}>
        <Moon size={16} className={styles.actionIcon} />
        <span>Dark mode</span>
      </div>
      <Switch
        checked={isDark}
        onCheckedChange={(value) => setTheme(value ? "dark" : "light")}
      />
    </div>
  );
};

export default DarkModeBtn;
