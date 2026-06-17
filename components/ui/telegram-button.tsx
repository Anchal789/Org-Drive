'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { iconsWithPaths } from '@/constants/common-constants';
import Icon from './icon';

export default function TelegramButton({
  children,
  size = 'lg',
  onClick,
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
  onClick?: () => void;
  className?: string;
  isNavigatingButton?: boolean;
  navigateTo?: Route<string>;
  type?: 'submit' | 'reset' | 'button';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
}) {
  const hClass = size === 'lg' ? 'h-[44px]' : 'h-[36px]';
  const navigate = useRouter();

  return (
    <button
      type={type}
      onClick={
        isNavigatingButton ? () => navigate.push(`${navigateTo}`) : onClick
      }
      disabled={disabled || loading}
      style={{
        color: 'var(--text-white)',
        background: 'var(--tg-blue)',
        borderColor: 'var(--tg-blue)',
        fontSize: 'var(--text-sm)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        fontWeight: 'var(--font-semibold)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.2s ease-in-out',
        opacity: disabled || loading ? '0.7' : '1',
        borderRadius: 'var(--radius-md)',
        width: '100%',
        height: size === 'lg' ? '44px' : '36px',
      }}
      className={className}
    >
      {loading ? (
        <>
          <span
            style={{
              width: 16,
              height: 16,
              border: '2px solid rgba(255,255,255,0.4)',
              borderTopColor: '#fff',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          {loadingText}
        </>
      ) : (
        <>
          <Icon
            d={iconsWithPaths.send}
            size={16}
            stroke={2}
            className="rotate-15"
          />
          {children}
        </>
      )}
    </button>
  );
}
