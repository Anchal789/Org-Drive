import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TINTS } from '@/constants/common-constants';
import type { UserAvatarProps } from '@/types/component-types';
import styles from './Component.module.scss';

export default function UserAvatar({
  initials,
  tone = 'slate',
  size = 'default',
  ring = false,
  className = '',
}: UserAvatarProps) {
  const t = TINTS[tone as keyof typeof TINTS] ?? TINTS.slate;

  const dynamicStyles = {
    '--avatar-bg': t.bg,
    '--avatar-tx': t.tx,
    '--avatar-bd': t.bd,
  } as React.CSSProperties;

  return (
    <Avatar
      size={size}
      className={`${styles.avatar} ${ring ? styles.hasRing : ''} ${className}`.trim()}
      style={dynamicStyles}
    >
      <AvatarFallback className={styles.fallback}>{initials}</AvatarFallback>
    </Avatar>
  );
}
