'use client';

import { Loader2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

type ButtonComponentProps = React.ComponentProps<typeof Button>;

interface AsyncButtonProps extends Omit<ButtonComponentProps, 'onClick'> {
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => unknown | Promise<unknown>;
}

export function AsyncButton({
  onClick,
  children,
  disabled,
  ...props
}: AsyncButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick) return;

    const result = onClick(e);

    if (result instanceof Promise) {
      setIsPending(true);

      try {
        await result;
      } catch (error) {
        void error;
      }

      setIsPending(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isPending}
      {...(props as ButtonComponentProps)}
    >
      {isPending && <Loader2 className='mr-2 size-4 animate-spin' />}
      {children}
    </Button>
  );
}
