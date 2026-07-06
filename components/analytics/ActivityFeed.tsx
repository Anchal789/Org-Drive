import { ActivityEvent } from "@/types/analytics";
import { TINTS } from "@/constants/common-constants";
import styles from "./Analytics.module.scss";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Badge from "../ui/badge";

export default function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>Recent activity</div>
        <span className={styles.cardSub}>Live · last 24h</span>
      </div>
      <div className={styles.activityList}>
        {events.map((a) => (
          <div key={a.id} className={styles.activityRow}>
            <Avatar
              className="h-7 w-7 border"
              style={{ borderColor: TINTS[a.tone].bd }}
            >
              <AvatarFallback
                style={{
                  background: TINTS[a.tone].bg,
                  color: TINTS[a.tone].bd,
                  fontSize: 12,
                }}
              >
                {a.userInitials}
              </AvatarFallback>
            </Avatar>
            <div className={styles.activityInfo}>
              <span className={styles.activityName}>{a.userName}</span>{" "}
              <span className={styles.activityAction}>{a.action}</span>{" "}
              <span className={styles.activityItem}>{a.itemName}</span>
            </div>
            <Badge
              outline
              className={styles.activityBadge}
              style={{
                color: TINTS[a.tone].tx,
                borderColor: TINTS[a.tone].bg,
                background: TINTS[a.tone].bg,
              }}
            >
              {a.action}
            </Badge>
            <span className={styles.activityTime}>{a.timeAgo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
