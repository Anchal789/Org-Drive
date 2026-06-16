'use client';

import { Loader2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

type ButtonComponentProps = React.ComponentProps<typeof Button>;

interface AsyncButtonProps extends Omit<ButtonComponentProps, 'onClick'> {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<unknown>;
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

    if (result && typeof (result as Promise<unknown>).then === 'function') {
      setIsPending(true);
      try {
        await result;
      } finally {
        setIsPending(false);
      }
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isPending}
      {...(props as ButtonComponentProps)}
    >
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
