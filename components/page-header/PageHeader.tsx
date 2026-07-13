import type { ReactNode } from 'react';
import styles from './PageHeader.module.scss';

export interface PageHeaderProps {
  icon: ReactNode;
  tone?: 'red' | 'violet' | 'blue' | 'amber' | 'slate' | 'default';
  title: ReactNode;
  subHeading: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  hideOnMobile?: boolean;
  className?: string;
}

export default function PageHeader({
  icon,
  tone = 'default',
  title,
  subHeading,
  action,
  children,
  hideOnMobile = false,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`${styles.header} ${hideOnMobile ? styles.hideOnMobile : ''} ${className}`}
    >
      <div className={styles.headingsContainer}>
        <div className={styles.headings}>
          <div className={`${styles.iconBox} ${styles[`tone-${tone}`]}`}>
            {icon}
          </div>
          <div>
            <div className={styles.title}>{title}</div>
            <div className={styles.subHeading}>{subHeading}</div>
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      {children && <div className={styles.content}>{children}</div>}
    </div>
  );
}
