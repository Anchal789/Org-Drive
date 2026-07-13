import { iconsWithPaths, TG_BLUE } from '@/constants/common-constants';

const seed = (x: number, y: number) => (x * 73 + y * 31 + (x ^ y) * 17) % 7 > 3;

export default function QrSampleImage({ size = 168 }) {
  const cells = 21;
  const blocks = [];
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const inFinder =
        (x < 7 && y < 7) ||
        (x > cells - 8 && y < 7) ||
        (x < 7 && y > cells - 8);
      if (!inFinder && seed(x, y)) blocks.push([x, y]);
    }
  }
  const s = size / cells;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className='block rounded-lg shrink-0'
    >
      <title>Telegram QR</title>
      <rect width={size} height={size} fill='#fff' />
      {blocks.map(([x, y]) => (
        <rect
          key={`qr-${x}-${y}`}
          x={x * s}
          y={y * s}
          width={s}
          height={s}
          fill='#111'
          rx={s * 0.2}
        />
      ))}
      {[
        [0, 0],
        [cells - 7, 0],
        [0, cells - 7],
      ].map(([fx, fy]) => (
        <g key={`telegram-${fx}-${fy}`}>
          <rect
            x={fx * s}
            y={fy * s}
            width={s * 7}
            height={s * 7}
            fill='none'
            stroke='#111'
            strokeWidth={s}
          />
          <rect
            x={(fx + 2) * s}
            y={(fy + 2) * s}
            width={s * 3}
            height={s * 3}
            fill='#111'
            rx={s * 0.6}
          />
        </g>
      ))}
      <circle cx={size / 2} cy={size / 2} r={size * 0.13} fill='#fff' />
      <circle cx={size / 2} cy={size / 2} r={size * 0.11} fill={TG_BLUE} />
      <g transform={`translate(${size / 2 - 8}, ${size / 2 - 8})`}>
        <path
          d={iconsWithPaths.send}
          fill='none'
          stroke='#fff'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          transform='scale(0.7)'
        />
      </g>
    </svg>
  );
}
