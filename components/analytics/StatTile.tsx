'use client';

import { TINTS } from '@/constants/common-constants';
import { generateSparklinePath } from '@/helpers/analytics.helper';
import type { StatData } from '@/types/analytics';
import Badge from '../ui/badge';
import styles from './Analytics.module.scss';

export default function StatTile({
  data,
  onClickAction,
}: {
  data: StatData;
  onClickAction?: () => void;
}) {
  return (
    <button
      type='button'
      className={`${styles.statCard} ${onClickAction ? styles.clickableStat : ''}`}
      onClick={onClickAction}
    >
      <div className={styles.statHeader}>
        <div className={styles.statLabel}>{data.label}</div>
        {data.delta && (
          <Badge
            outline
            customTone={{
              background: TINTS[data.tone].bg,
              color: TINTS[data.tone].tx,
              border: TINTS[data.tone].bg,
            }}
            className={styles.statDelta}
          >
            <span className={styles.dot} />
            {data.delta}
          </Badge>
        )}
      </div>
      <div className={styles.statBody}>
        <div>
          <div className={styles.statValue}>{data.value}</div>
          {data.sub && <div className={styles.statSub}>{data.sub}</div>}
        </div>
        {data.sparkData && (
          <svg
            width='70'
            height='26'
            viewBox='0 0 70 26'
            aria-hidden='true'
            focusable='false'
          >
            <path
              d={generateSparklinePath(data.sparkData, 70, 26)}
              fill='none'
              stroke={TINTS[data.tone].bd}
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        )}
      </div>
    </button>
  );
}
