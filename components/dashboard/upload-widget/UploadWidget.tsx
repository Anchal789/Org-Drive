"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { iconsWithPaths, TINTS } from "@/constants/common-constants";
import { formatBytes, useUploadStore } from "@/store/store";
import styles from "./UploadWidget.module.scss";
import type { DisplayItem, Tone, UploadItem } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Check, RefreshCw } from "lucide-react";

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
  onAbort,
}: {
  item: DisplayItem;
  isLast: boolean;
  onAbort: (item: DisplayItem) => void;
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
            style={{ animation: "spin 1s linear infinite" }}
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
        <div className={styles.itemName}>
          {item.isFolderGroup && (
            <Icon
              d={iconsWithPaths.folder}
              size={12}
              style={{ marginRight: 6, display: "inline" }}
            />
          )}
          {item.name}
        </div>
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

      <Button onClick={() => onAbort(item)}>
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
    isProcessing,
    abortUpload,
  } = useUploadStore();

  const router = useRouter();
  const [collapseWidget, setCollapseWidget] = useState<boolean>(false);

  const rawItems: UploadItem[] = Object.values(uploadsRecord);
  const displayItems: DisplayItem[] = [];
  const folderMap = new Map<string, UploadItem[]>();

  rawItems.forEach((item) => {
    if (item.folderName) {
      if (!folderMap.has(item.folderName)) folderMap.set(item.folderName, []);
      folderMap.get(item.folderName)!.push(item);
    } else {
      displayItems.push(item);
    }
  });

  folderMap.forEach((folderFiles, folderName) => {
    const totalFiles = folderFiles.length;
    const doneFiles = folderFiles.filter((f) => f.state === "done").length;
    const errorFiles = folderFiles.filter(
      (f) => f.state === "error" || f.state === "aborted",
    ).length;
    const uploadingFile = folderFiles.find((f) => f.state === "uploading");

    let state: UploadItem["state"] = "queued";
    if (doneFiles === totalFiles) state = "done";
    else if (errorFiles + doneFiles === totalFiles) state = "error";
    else if (uploadingFile || doneFiles > 0) state = "uploading";

    const donePct = (doneFiles / totalFiles) * 100;
    const uploadingPct = uploadingFile ? uploadingFile.pct / totalFiles : 0;
    const totalPct = Math.round(donePct + uploadingPct);

    const totalRawSize = folderFiles.reduce(
      (acc, f) => acc + (f.rawSize || 0),
      0,
    );

    displayItems.push({
      id: folderName,
      name: folderName,
      isFolderGroup: true,
      originalFiles: folderFiles,
      size: formatBytes(totalRawSize),
      state: state,
      pct: totalPct,
      eta: uploadingFile?.eta,
    });
  });

  const itemsStillUploading = displayItems.filter(
    (i) =>
      i.state === "uploading" || i.state === "queued" || i.state === "indexing",
  );
  const doneCount = displayItems.filter((i) => i.state === "done").length;

  const estimateTime = rawItems.reduce((acc, i) => acc + (i?.eta || 0) || 0, 0);
  const estimateHours = Math.floor(estimateTime / 60 / 60);
  const estimateMinutes = Math.floor((estimateTime / 60) % 60);
  const estimateSeconds = Math.floor(estimateTime % 60);

  const handleAbort = (item: DisplayItem) => {
    if (item.isFolderGroup) {
      item.originalFiles.forEach((f) => abortUpload(f.id));
    } else {
      abortUpload(item.id);
    }
  };

  useEffect(() => {
    if (!isProcessing && rawItems.length > 0) {
      router.refresh();
    }
  }, [isProcessing, rawItems.length, router]);

  if (!isVisible) return null;

  return (
    <div className={styles.widget}>
      <div className={styles.head}>
        {itemsStillUploading.length > 0 ? (
          <>
            <RefreshCw
              size={14}
              style={{
                animation: "spin 1.6s linear infinite",
                color: "var(--primary)",
              }}
            />
            <span className={styles.headTitle}>
              Uploading {displayItems.length - doneCount} of{" "}
              {displayItems.length}
            </span>
          </>
        ) : (
          <>
            <Check size={14} style={{ color: "var(--primary)" }} />
            <span className={styles.headTitle}>
              {doneCount} of {displayItems.length} uploaded successfully
            </span>
          </>
        )}
        {itemsStillUploading.length > 0 && (
          <span className={styles.headTime}>
            {estimateHours > 0 && `${estimateHours}h `}
            {estimateMinutes}m {estimateSeconds}s left
          </span>
        )}
        <Button onClick={() => setCollapseWidget(!collapseWidget)}>
          <Icon
            d={collapseWidget ? iconsWithPaths.chevUp : iconsWithPaths.chevDown}
            size={14}
            style={{ opacity: 0.8 }}
          />
        </Button>
        <Button onClick={closeWidget}>
          <Icon d={iconsWithPaths.x} size={14} />
        </Button>
      </div>

      <div
        className={`${styles.list} ${collapseWidget ? styles.listCollapsed : ""}`}
      >
        <div className={styles.listInner}>
          {displayItems.map((item, i) => (
            <UploadItemRow
              key={item.id}
              item={item}
              isLast={i === displayItems.length - 1}
              onAbort={handleAbort}
            />
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <Icon d={iconsWithPaths.shield} size={11} />
        End-to-end encrypted via your Telegram channel.
      </div>
    </div>
  );
}
