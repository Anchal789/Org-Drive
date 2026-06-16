'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="bottom-center"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      closeButton
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'cn-toast',
          success:
            '!bg-green-300 !text-green-900 !border-green-200 dark:!bg-green-700 dark:!text-green-100 dark:!border-green-900',
          error:
            '!bg-red-300 !text-red-900 !border-red-200 dark:!bg-red-700 dark:!text-red-100 dark:!border-red-900',
          warning:
            '!bg-yellow-300 !text-yellow-900 !border-yellow-200 dark:!bg-yellow-700 dark:!text-yellow-100 dark:!border-yellow-900',
          info: '!bg-blue-300 !text-blue-900 !border-blue-200 dark:!bg-blue-700 dark:!text-blue-100 dark:!border-blue-900',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
