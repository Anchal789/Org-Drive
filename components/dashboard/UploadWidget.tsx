import Icon from "@/components/ui/Icon";
import {
  iconsWithPaths,
  TG_BLUE,
  TG_BLUE_BG,
  TINTS,
} from "@/constants/common-constants";
import { UPLOAD_ITEMS } from "@/constants/dashboard-constants";
import type { UploadItem, Tone } from "@/types/dashboard";
import styles from "@/styles/components/UploadWidget.module.scss";

const STATE_TO_TONE: Record<UploadItem["state"], Tone> = {
  done: "green",
  indexing: "violet",
  queued: "slate",
  uploading: "sky",
};

function UploadItemRow({
  item,
  isLast,
}: {
  item: UploadItem;
  isLast: boolean;
}) {
  const tone = STATE_TO_TONE[item.state];
  const tint = TINTS[tone];
  const stateLabel = item.state === "indexing" ? "Indexing for AI" : item.state;

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
            <span className={styles.uploadingPct}>{item.pct}</span>
          </>
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
    </div>
  );
}

export default function UploadWidget() {
  const items = UPLOAD_ITEMS;
  const doneCount = items.filter((i) => i.state === "done").length;

  return (
    <div className={styles.widget}>
      {/* Header */}
      <div className={styles.head}>
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
        <span className={styles.headTime}>1m 24s left</span>
        <Icon d={iconsWithPaths.chevDown} size={14} style={{ opacity: 0.8 }} />
        <Icon d={iconsWithPaths.x} size={14} style={{ opacity: 0.8 }} />
      </div>

      {/* Channel destination */}
      <div className={styles.channel} style={{ background: TG_BLUE_BG }}>
        <Icon
          d={iconsWithPaths.send}
          size={12}
          style={{ color: TG_BLUE, transform: "rotate(15deg)" }}
        />
        <span style={{ fontSize: 11, color: TG_BLUE, fontWeight: 500 }}>
          Streaming to <strong>@zurutech_drive</strong> · node-eu-1
        </span>
      </div>

      {/* List */}
      <div className={styles.list}>
        {items.map((item, i) => (
          <UploadItemRow
            key={item.name}
            item={item}
            isLast={i === items.length - 1}
          />
        ))}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Icon d={iconsWithPaths.shield} size={11} />
        End-to-end encrypted via your Telegram channel.
      </div>
    </div>
  );
}
