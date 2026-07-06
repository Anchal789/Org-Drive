export default function Icon({
  d,
  size = 16,
  stroke = 1.6,
  fill = 'none',
  className = '',
  style,
}: {
  d: string;
  size?: number;
  stroke?: number;
  fill?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill={fill}
      stroke='currentColor'
      strokeWidth={stroke}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={`shrink-0 ${className}`}
      style={style}
    >
      <title>Icon</title>
      <path d={d} />
    </svg>
  );
}
