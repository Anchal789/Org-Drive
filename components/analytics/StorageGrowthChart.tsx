'use client';
// eslint-disable-next-line react-doctor/prefer-dynamic-import
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import styles from './Analytics.module.scss';

const chartConfig = {
  storage: {
    label: 'Storage (GB)',
    color: 'var(--primary)',
  },
} satisfies ChartConfig;

export default function StorageGrowthChart({
  chartData,
}: {
  chartData: {
    label: string;
    storage: number;
  }[];
}) {
  return (
    <ChartContainer config={chartConfig} className={styles.chartContainer}>
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
  );
}
