'use client';

import { useIsClient } from '@/hooks/use-is-client';
import { formatRecentLogTime } from '@/lib/utils';

interface RecentLogTimeLabelProps {
  date: Date;
  mode: 'weekday' | 'time';
}

export default function RecentLogTimeLabel({
  date,
  mode,
}: RecentLogTimeLabelProps) {
  const isClient = useIsClient();

  if (!isClient) return null;

  return <>{formatRecentLogTime(date, mode)}</>;
}
