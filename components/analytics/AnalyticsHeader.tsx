"use client";

import { ChevronLeft, RefreshCw } from "lucide-react";
import { Timeframe } from "@/types/analytics";
import styles from "./Analytics.module.scss";

interface AnalyticsHeaderProps {
  view: "overview" | "insights";
  setView: (view: "overview" | "insights") => void;
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
}

export default function AnalyticsHeader({
  view,
  setView,
  timeframe,
  setTimeframe,
}: AnalyticsHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.mobileHeader}>
        {view === "insights" ? (
          <ChevronLeft
            size={20}
            onClick={() => setView("overview")}
            style={{ cursor: "pointer" }}
          />
        ) : (
          <ChevronLeft size={20} />
        )}
        <div className={styles.mobileTitle}>Analytics</div>
        <RefreshCw size={16} />
      </div>

      <div className={styles.desktopHeader}>
        <div className={styles.subtitle}>
          {view === "overview" ? "Admin" : "Insights"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {view === "insights" && (
            <ChevronLeft
              size={24}
              style={{ cursor: "pointer", color: "var(--muted-foreground)" }}
              onClick={() => setView("overview")}
            />
          )}
          <h1 className={styles.title}>
            {view === "overview" ? "Analytics" : "Storage breakdown"}
          </h1>
        </div>
        <p className={styles.description}>
          {view === "overview"
            ? "How you are using Org Drive — storage, activity, and Telegram bridge health."
            : "Where the storage lives — by folder and contributor."}
        </p>
      </div>

      {view === "overview" && (
        <div className={styles.filterGroup}>
          {(["24h", "7d", "30d", "90d"] as Timeframe[]).map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setTimeframe(p)}
              className={`${styles.filterBtn} ${timeframe === p ? styles.filterBtnActive : ""}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
