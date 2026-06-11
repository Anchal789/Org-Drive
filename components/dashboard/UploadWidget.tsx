"use client";

import Icon from "@/components/ui/Icon";
import { iconsWithPaths, TINTS } from "@/constants/common-constants";
import type { UploadItem, Tone } from "@/types/dashboard";
import styles from "@/styles/components/UploadWidget.module.scss";
import { useUploadStore } from "@/store/store";
import { Button } from "@base-ui/react";

const STATE_TO_TONE: Record<UploadItem["state"], Tone> = {
  done: "green",
  indexing: "violet",
  queued: "slate",
  uploading: "sky",
  error: "red",
  aborted: "red",
};

function UploadItemRow({
  item,
  isLast,
  abortUpload,
}: {
  item: UploadItem;
  isLast: boolean;
  abortUpload: (fileName: string) => void;
}) {
  const tone = STATE_TO_TONE[item.state];
  const tint = TINTS[tone];
  const stateLabel =
    item.state === "indexing"
      ? "Indexing for AI"
      : item.state === "error"
        ? "Upload Failed"
        : item.state === "aborted"
          ? "Upload Cancelled"
          : item.state;

  return (
    <div className={`${styles.itemRow} ${isLast ? styles.itemRowLast : ""}`}>
      <div
        className={styles.itemIcon}
        style={{ background: tint.bg, color: tint.tx }}
      >
        {item.state === "done" && (
          <Icon d={iconsWithPaths.check} size={14} stroke={2.4} />
        )}
        {item.state === "indexing" && (
          <Icon
            d={iconsWithPaths.sparkle}
            size={13}
            style={{ animation: "spin 2.4s linear infinite" }}
          />
        )}
        {item.state === "queued" && <Icon d={iconsWithPaths.clock} size={13} />}
        {item.state === "uploading" && (
          <>
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              className={styles.uploadingRing}
            >
              <circle
                cx="15"
                cy="15"
                r="12"
                fill="none"
                stroke="var(--border)"
                strokeWidth="2"
              />
              <circle
                cx="15"
                cy="15"
                r="12"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeDasharray={`${(2 * Math.PI * 12 * item.pct) / 100} 999`}
                strokeLinecap="round"
                transform="rotate(-90 15 15)"
              />
            </svg>
            <span className={styles.uploadingPct}>{item.pct}%</span>
          </>
        )}
        {(item.state === "error" || item.state === "aborted") && (
          <Icon d={iconsWithPaths.x} size={14} stroke={2.4} />
        )}
      </div>

      <div className={styles.itemBody}>
        <div className={styles.itemName}>{item.name}</div>
        <div className={styles.itemMeta}>
          <span className={styles.itemSize}>{item.size}</span>
          <span className={styles.itemDot} style={{ color: tint.tx }}>
            ·
          </span>
          <span className={styles.itemState} style={{ color: tint.tx }}>
            {stateLabel}
          </span>
        </div>
      </div>

      <Button onClick={() => abortUpload(item.name)}>
        <Icon
          d={
            item.state === "done"
              ? iconsWithPaths.check
              : item.state === "uploading" || item.state === "queued"
                ? iconsWithPaths.x
                : iconsWithPaths.more
          }
          size={13}
          style={{ color: "var(--muted-foreground)", flexShrink: 0 }}
        />
      </Button>
    </div>
  );
}

export default function UploadWidget() {
  const {
    isWidgetVisible: isVisible,
    uploads: uploadsRecord,
    closeWidget,
    abortUpload,
  } = useUploadStore();

  const items = Object.values(uploadsRecord);

  const itemsStillUploading = items.filter(
    (i) =>
      i.state === "uploading" || i.state === "queued" || i.state === "indexing",
  );
  const doneCount = items.filter((i) => i.state === "done").length;
  const estimateTime = items.reduce((acc, i) => acc + (i?.eta || 0) || 0, 0);
  const estimateHours = Math.floor(estimateTime / 60 / 60);
  const estimateMinutes = Math.floor((estimateTime / 60) % 60);
  const estimateSeconds = Math.floor(estimateTime % 60);

  if (!isVisible) return null;

  return (
    <div className={styles.widget}>
      <div className={styles.head}>
        {itemsStillUploading.length > 0 ? (
          <>
            <Icon
              d={iconsWithPaths.refresh}
              size={14}
              style={{
                animation: "spin 1.6s linear infinite",
                color: "var(--primary)",
              }}
            />
            <span className={styles.headTitle}>
              Uploading {items.length - doneCount} of {items.length}
            </span>
          </>
        ) : (
          <>
            <Icon
              d={iconsWithPaths.check}
              size={14}
              style={{ color: "var(--primary)" }}
            />
            <span className={styles.headTitle}>
              {doneCount} of {items.length} uploaded successfully
            </span>
          </>
        )}
        {itemsStillUploading.length > 0 && (
          <span className={styles.headTime}>
            {estimateHours > 0 && `${estimateHours}h `}
            {estimateMinutes}m {estimateSeconds}s left
          </span>
        )}
        <Icon d={iconsWithPaths.chevDown} size={14} style={{ opacity: 0.8 }} />
        <button onClick={closeWidget} className={styles.closeBtn}>
          <Icon d={iconsWithPaths.x} size={14} />
        </button>
      </div>
      <div className={styles.list}>
        {items.map((item, i) => (
          <UploadItemRow
            key={item.id}
            item={item}
            isLast={i === items.length - 1}
            abortUpload={abortUpload}
          />
        ))}
      </div>
      <div className={styles.footer}>
        <Icon d={iconsWithPaths.shield} size={11} />
        End-to-end encrypted via your Telegram channel.
      </div>
    </div>
  );
}
