import type { SparkProps } from '@/types/component-types';

export default function Spark({
  data = [4, 7, 5, 9, 6, 11, 8, 12],
  w = 80,
  h = 24,
  color = 'var(--primary)',
}: SparkProps) {
  const max = Math.max(...data);
  const pts = data
    .map(
      (val, i) =>
        `${(i / (data.length - 1)) * w},${h - (val / max) * (h - 2) - 1}`,
    )
    .join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} data-slot="spark">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        points={pts}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
