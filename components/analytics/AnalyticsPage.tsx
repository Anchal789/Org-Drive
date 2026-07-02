"use client";

import { useState, useMemo } from "react";
import { AnalyticsDataPayload, Timeframe } from "@/types/analytics";
import {
  formatBytes,
  getCutoffDate,
  generateTimeBuckets,
} from "@/helpers/analytics.helper";
import styles from "./Analytics.module.scss";
import AnalyticsHeader from "./AnalyticsHeader";
import OverviewDashboard from "./OverviewDashboard";
import StorageInsights from "./StorageInsights";

export default function AnalyticsPage({
  initialData,
}: {
  initialData: AnalyticsDataPayload;
}) {
  const [view, setView] = useState<"overview" | "insights">("overview");
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");

  const currentUploads = useMemo(() => {
    const cutoff = getCutoffDate(timeframe);
    return initialData.uploadsLast90Days.filter(
      (u) => new Date(u.createdAt) >= cutoff,
    );
  }, [initialData.uploadsLast90Days, timeframe]);

  const uploadActivity = useMemo(() => {
    return generateTimeBuckets(currentUploads, timeframe);
  }, [currentUploads, timeframe]);

  const overviewProps = {
    storageUsed: {
      label: "Storage used",
      value: formatBytes(initialData.overview.totalSizeBytes),
      sub: "across your drive",
      tone: "violet" as const,
      sparkData: [40, 44, 48, 52, 58, 62, 64],
    },
    totalFiles: {
      label: "Files",
      value: String(initialData.overview.totalFilesCount),
      sub: "total indexed",
      delta: `+${currentUploads.length}`,
      tone: "green" as const,
      sparkData: [180, 192, 201, 213, 220, 235, 248],
    },
    activeMembers: {
      label: "Active members",
      value: String(initialData.overview.activeMembers),
      sub: "your account",
      tone: "sky" as const,
    },
    systemHealth: {
      label: "Telegram p95",
      value: "84ms",
      sub: "EU/US/AP healthy",
      delta: "-12%",
      tone: "green" as const,
      sparkData: [12, 10, 11, 9, 8, 9, 8],
    },
    uploadActivity,
    storageByType: initialData.overview.storageByType,
    recentActivity: initialData.overview.recentActivity,
    topContributors: initialData.overview.topContributors,
  };

  return (
    <div className={styles.container}>
      <div className={styles.scrollArea}>
        <AnalyticsHeader
          view={view}
          setView={setView}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
        />

        {view === "overview" ? (
          <OverviewDashboard
            data={overviewProps}
            timeframe={timeframe}
            onStorageClickAction={() => setView("insights")}
          />
        ) : (
          <StorageInsights data={initialData.insights} />
        )}
      </div>
    </div>
  );
}
