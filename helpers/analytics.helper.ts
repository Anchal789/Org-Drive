import type { ChartBucket, Timeframe } from '@/types/analytics';
import type { Tone } from '@/types/dashboard';

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function getActionTone(action: string): Tone {
  const normalized = action.toLowerCase();
  if (normalized.includes('upload')) return 'sky';
  if (normalized.includes('share')) return 'violet';
  if (normalized.includes('delete')) return 'red';
  if (normalized.includes('download')) return 'slate';
  return 'green';
}

export function generateSparklinePath(
  data: number[],
  width: number,
  height: number,
): string {
  if (!data || data.length === 0) return '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const xStep = width / (data.length - 1 || 1);

  return data
    .map((val, i) => {
      const x = i * xStep;
      const y = height - ((val - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export function getCutoffDate(timeframe: Timeframe): Date {
  const date = new Date();
  if (timeframe === '24h') date.setHours(date.getHours() - 24);
  else if (timeframe === '7d') date.setDate(date.getDate() - 7);
  else if (timeframe === '30d') date.setDate(date.getDate() - 30);
  else if (timeframe === '90d') date.setDate(date.getDate() - 90);
  return date;
}

export function generateTimeBuckets(
  files: { createdAt: string }[],
  timeframe: Timeframe,
): ChartBucket[] {
  const now = new Date();
  let bucketsCount = 30;
  let intervalMs = 24 * 60 * 60 * 1000;

  if (timeframe === '24h') {
    bucketsCount = 24;
    intervalMs = 60 * 60 * 1000;
  } else if (timeframe === '7d') {
    bucketsCount = 7;
  } else if (timeframe === '90d') {
    bucketsCount = 12;
    intervalMs = 7 * 24 * 60 * 60 * 1000;
  }

  const buckets: ChartBucket[] = Array.from({ length: bucketsCount }).map(
    (_, i) => {
      const bucketTime = new Date(
        now.getTime() - (bucketsCount - 1 - i) * intervalMs,
      );
      let label = bucketTime.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      if (timeframe === '24h') {
        label = bucketTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          hour12: true,
        });
      }
      return { label, uploads: 0, indexed: 0 };
    },
  );

  const startTime = now.getTime() - bucketsCount * intervalMs;

  for (const f of files) {
    const fileTime = new Date(f.createdAt).getTime();
    if (fileTime >= startTime) {
      const bucketIndex = Math.floor((fileTime - startTime) / intervalMs);
      if (bucketIndex >= 0 && bucketIndex < bucketsCount) {
        buckets[bucketIndex].uploads += 1;
        buckets[bucketIndex].indexed += 1;
      }
    }
  }

  return buckets;
}
