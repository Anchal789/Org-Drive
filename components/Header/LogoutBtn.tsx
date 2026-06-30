"use client";

import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import styles from "./DriveTopbar.module.scss";
import { FunctionComponent } from "react";
import { SessionUser } from "@/types/auth";
import { logoutUser } from "@/services/logout-service";

const LogoutBtn: FunctionComponent<{ user: SessionUser }> = ({ user }) => {
  return (
    <Button
      className={`${styles.actionButton} ${styles.logoutButton}`}
      onClick={() => logoutUser(user)}
    >
      <LogOut
        size={16}
        className={`${styles.actionIcon} ${styles.logoutIcon}`}
      />
      <span>Logout</span>
    </Button>
  );
};

export default LogoutBtn;
