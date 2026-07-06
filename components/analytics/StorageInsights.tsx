'use client';

import { Folder } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { TINTS } from '@/constants/common-constants';
import type { AnalyticsInsightsData } from '@/types/analytics';
import Badge from '../ui/badge';
import styles from './Analytics.module.scss';

const chartConfig = {
  storage: {
    label: 'Storage (GB)',
    color: 'var(--primary)',
  },
} satisfies ChartConfig;

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

          <ChartContainer
            config={chartConfig}
            className={styles.chartContainer}
          >
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id='fillStorage' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='var(--color-storage)'
                    stopOpacity={0.3}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-storage)'
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray='3 3'
                stroke='var(--border)'
              />
              <XAxis
                dataKey='label'
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                type='natural'
                dataKey='storage'
                stroke='var(--color-storage)'
                strokeWidth={2.5}
                fill='url(#fillStorage)'
                fillOpacity={1}
                activeDot={{
                  r: 5,
                  fill: 'var(--color-storage)',
                  stroke: 'var(--background)',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>
    </>
  );
}
