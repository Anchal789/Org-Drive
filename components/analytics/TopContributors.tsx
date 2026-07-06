import { Contributor } from "@/types/analytics";
import { TINTS } from "@/constants/common-constants";
import styles from "./Analytics.module.scss";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TopContributors({
  contributors,
}: {
  contributors: Contributor[];
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>Contributors</div>
        <span className={styles.cardSub}>your account</span>
      </div>
      <div>
        {contributors.map((p) => (
          <div key={p.id} className={styles.contributorRow}>
            <Avatar
              className="h-7 w-7 border"
              style={{ borderColor: TINTS[p.tone].bd }}
            >
              <AvatarFallback
                style={{
                  background: TINTS[p.tone].bg,
                  color: TINTS[p.tone].bd,
                  fontSize: 12,
                }}
              >
                {p.initials}
              </AvatarFallback>
            </Avatar>
            <div className={styles.contributorInfo}>
              <div className={styles.contributorTop}>
                <span>{p.name}</span>
                <span className={styles.contributorMeta}>
                  {p.filesCount} files · {p.sizeFormatted}
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${p.percentage}%`,
                    background: TINTS[p.tone].bd,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
