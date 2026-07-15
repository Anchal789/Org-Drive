'use client';

import { Send } from 'lucide-react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import styles from './TelegramButton.module.scss';

export default function TelegramButton({
  children,
  size = 'lg',
  onClickAction,
  className = '',
  isNavigatingButton = false,
  navigateTo = '/',
  type = 'button',
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
}: {
  children: React.ReactNode;
  size?: 'sm' | 'lg';
  onClickAction?: () => void;
  className?: string;
  isNavigatingButton?: boolean;
  navigateTo?: Route<string>;
  type?: 'submit' | 'reset' | 'button';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
}) {
  const navigate = useRouter();

  return (
    <button
      type={type}
      onClick={
        isNavigatingButton
          ? () => navigate.push(`${navigateTo}`)
          : onClickAction
      }
      disabled={disabled || loading}
      style={{
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? '0.7' : '1',
        height: size === 'lg' ? '44px' : '36px',
      }}
      className={cn(styles.button, className)}
    >
      {loading ? (
        <>
          <span className={styles.spinner} />
          {loadingText}
        </>
      ) : (
        <>
          <Send size={16} className='rotate-15' />
          {children}
        </>
      )}
    </button>
  );
}
