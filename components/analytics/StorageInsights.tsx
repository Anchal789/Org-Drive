'use client';

import { Folder } from 'lucide-react';
import dynamic from 'next/dynamic';
import { TINTS } from '@/constants/common-constants';
import type { AnalyticsInsightsData } from '@/types/analytics';
import Badge from '../ui/badge';
import styles from './Analytics.module.scss';

const DynamicStorageGrowthChart = dynamic(
  () => import('./StorageGrowthChart'),
  {
    ssr: false,
  },
);

export default function StorageInsights({
  data,
}: {
  data: AnalyticsInsightsData;
}) {
  const chartData = [
    {
      label: '6m ago',
      storage: Number((data.totalStorageGB * 0.25).toFixed(2)),
    },
    {
      label: '5m ago',
      storage: Number((data.totalStorageGB * 0.4).toFixed(2)),
    },
    {
      label: '4m ago',
      storage: Number((data.totalStorageGB * 0.55).toFixed(2)),
    },
    {
      label: '3m ago',
      storage: Number((data.totalStorageGB * 0.7).toFixed(2)),
    },
    {
      label: '2m ago',
      storage: Number((data.totalStorageGB * 0.85).toFixed(2)),
    },
    {
      label: '1m ago',
      storage: Number((data.totalStorageGB * 0.95).toFixed(2)),
    },
    { label: 'Today', storage: Number(data.totalStorageGB.toFixed(2)) },
  ];

  return (
    <>
      <div className={styles.treemapGrid}>
        {data.folders.slice(0, 4).map((f, i) => {
          const area = ['a', 'b', 'c', 'd'][i];
          return (
            <div
              key={f.id}
              className={styles.treeItem}
              style={{
                gridArea: area,
                background: TINTS[f.tone].bg,
                border: `1px solid ${TINTS[f.tone].bd}`,
                color: TINTS[f.tone].tx,
              }}
            >
              <div>
                <div className={styles.treeTitle}>
                  <Folder size={14} fill='currentColor' strokeWidth={0} />
                  {f.name}
                </div>
                <div className={styles.treeSub}>{f.filesCount} files</div>
              </div>
              <div className={styles.treeVal}>
                {f.sizeFormatted.split(' ')[0]}
                <span className={styles.treeValSub}>
                  {f.sizeFormatted.split(' ')[1]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.listGrid}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>All folders</div>
          <div className={styles.cardSub}>sorted by size</div>
        </div>
        {data.folders.map((f) => (
          <div key={f.id} className={styles.listRow}>
            <div className={styles.listNameGroup}>
              <Folder
                size={13}
                fill={TINTS[f.tone].bd}
                strokeWidth={0}
                color={TINTS[f.tone].bd}
              />
              <span className={styles.listName}>{f.name}</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${(f.sizeBytes / Math.max(data.totalStorageGB * 1024 * 1024 * 1024, 1)) * 100}%`,
                  background: TINTS[f.tone].bd,
                }}
              />
            </div>
            <span className={styles.listSize}>{f.sizeFormatted}</span>
            <span className={styles.listFiles}>{f.filesCount} files</span>
          </div>
        ))}
      </div>

      <div className={styles.growthGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardTitle}>Storage growth</div>
            </div>
            <Badge
              tone='gray'
              style={{ color: TINTS.violet.tx, background: TINTS.violet.bg }}
            >
              {data.growthRate}
            </Badge>
          </div>

          {/* Render the dynamic chart here! */}
          <DynamicStorageGrowthChart chartData={chartData} />
        </div>
      </div>
    </>
  );
}
