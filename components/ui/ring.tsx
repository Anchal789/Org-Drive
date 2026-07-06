import type { RingProps } from '@/types/component-types';

export default function Ring({
  size = 56,
  pct = 64,
  color = 'var(--primary)',
  className = '',
}: RingProps) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
      data-slot="ring"
      data-pct={pct}
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--border)"
        strokeWidth={5}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeDasharray={`${(c * pct) / 100} ${c}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
