import { TINTS } from '@/constants/common-constants';
import { cn } from '@/lib/utils';
import type { BadgeProps } from '@/types/component-types';
import styles from './Badge.module.scss';

const EMPTY_STYLE: React.CSSProperties = {};

export default function Badge({
  children,
  tone,
  outline = false,
  className = '',
  style = EMPTY_STYLE,
  customTone,
}: BadgeProps) {
  const toneKey = tone as keyof typeof TINTS;
  const toneStyles = customTone
    ? {
        ...customTone,
        border: `1px solid ${customTone.border ?? 'transparent'}`,
      }
    : tone
      ? {
          background: outline ? 'transparent' : TINTS[toneKey]?.bg,
          color: TINTS[toneKey]?.tx,
          border: `1px solid ${outline ? TINTS[toneKey]?.bd : 'transparent'}`,
        }
      : {};

  return (
    <span
      data-slot='badge'
      data-tone={tone}
      data-outline={outline}
      className={cn(styles.badge, className)}
      style={{
        ...toneStyles,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
