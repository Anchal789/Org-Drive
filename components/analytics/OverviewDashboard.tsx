"use client";

import { AnalyticsOverviewData, Timeframe } from "@/types/analytics";
import { TINTS } from "@/constants/common-constants";
import styles from "./Analytics.module.scss";
import StatTile from "./StatTile";
import ActivityFeed from "./ActivityFeed";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import dynamic from "next/dynamic";
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), {
  ssr: false,
});
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false },
);
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), {
  ssr: false,
});
const Label = dynamic(() => import("recharts").then((mod) => mod.Label), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), {
  ssr: false,
});
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
  ssr: false,
});

const chartConfig = {
  uploads: {
    label: "Uploads",
    color: "var(--primary)",
  },
  indexed: {
    label: "Indexed",
    color: TINTS.violet.bd,
  },
} satisfies ChartConfig;

export default function OverviewDashboard({
  data,
  timeframe,
  onStorageClickAction,
}: {
  data: AnalyticsOverviewData;
  timeframe: Timeframe;
  onStorageClickAction: () => void;
}) {
  return (
    <>
      <div className={styles.kpiGrid}>
        <StatTile
          data={data.storageUsed}
          onClickAction={onStorageClickAction}
        />
        <StatTile data={data.totalFiles} />
        <StatTile data={data.activeMembers} />
        <StatTile data={data.systemHealth} />
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardTitle}>Upload activity</div>
              <div className={styles.cardSub}>
                Files added · last {timeframe}
              </div>
            </div>
          </div>

          <ChartContainer
            config={chartConfig}
            className={styles.chartContainer}
          >
            <BarChart accessibilityLayer data={data.uploadActivity}>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--border)"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="uploads"
                fill="var(--color-uploads)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>

        <div className={styles.card}>
          <div>
            <div className={styles.cardTitle}>By file type</div>
            <div className={styles.cardSub}>Storage share across files</div>
          </div>
          <div className={styles.donutWrapper}>
            <ChartContainer
              config={{
                sizeBytes: {
                  label: "Storage Used",
                },
              }}
              className={styles.donutChart}
            >
              <PieChart responsive>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={data.storageByType}
                  dataKey="sizeBytes"
                  nameKey="name"
                  innerRadius={44}
                  outerRadius={60}
                  strokeWidth={0}
                >
                  {data.storageByType.map((entry) => (
                    <Cell key={entry.sizeBytes} fill={TINTS[entry.tone].bd} />
                  ))}

                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy - 4}
                              className="fill-foreground text-[22px] font-bold"
                            >
                              {data.storageUsed.value.split(" ")[0]}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy + 16}
                              className="fill-muted-foreground text-[10px]"
                            >
                              {data.storageUsed.value.split(" ")[1]} used
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className={styles.donutList}>
              {data.storageByType.map((type) => (
                <div key={type.name} className={styles.donutListItem}>
                  <span
                    className={styles.legendDot}
                    style={{ background: TINTS[type.tone].bd }}
                  />
                  <span className={styles.donutListName}>{type.name}</span>
                  <span className={styles.donutListVal}>
                    {type.sizeFormatted}
                  </span>
                  <span className={styles.donutListPct}>
                    {type.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mobileSectionTitle}>Activity</div>

      <div className={styles.mainGrid}>
        <ActivityFeed events={data.recentActivity} />
        {/* <TopContributors contributors={data.topContributors} /> */}
      </div>
    </>
  );
}
