'use client';

import { LogOut } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { logoutUser } from '@/services/logout-service';
import type { SessionUser } from '@/types/auth';
import { Button } from '../ui/button';
import styles from './DriveTopbar.module.scss';

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
