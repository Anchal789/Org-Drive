'use client';

import { useState } from 'react';
import { useIsClient } from '@/hooks/use-is-client';

const RETENTION_DAYS = 30;

interface AutoDeleteCountdownProps {
  createdAt: string | Date;
  expiringSoonClassName: string;
  normalClassName?: string;
  labelPrefix?: string;
}

export default function AutoDeleteCountdown({
  createdAt,
  expiringSoonClassName,
  normalClassName = '',
  labelPrefix = '',
}: AutoDeleteCountdownProps) {
  const isClient = useIsClient();
  const [now] = useState(() => Date.now());

  if (!isClient) {
    return <span className={normalClassName} />;
  }

  const autoDeleteAt =
    new Date(createdAt).getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const daysLeft = Math.ceil((autoDeleteAt - now) / (1000 * 60 * 60 * 24));

  return (
    <span className={daysLeft < 10 ? expiringSoonClassName : normalClassName}>
      {daysLeft > 0 ? `${labelPrefix}in ${daysLeft} days` : 'Expired'}
    </span>
  );
}
