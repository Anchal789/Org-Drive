import Btn from "@/components/ui/Btn";
import Icon from "@/components/ui/Icon";
import { iconsWithPaths } from "@/constants/common-constants";
import styles from "@/styles/components/DriveCrumb.module.scss";

type DriveCrumbProps = {
  inFolder?: string;
};

export default function DriveCrumb({ inFolder }: DriveCrumbProps) {
  return (
    <div className={styles.crumb}>
      <div className={styles.title}>
        {inFolder ? (
          <>
            <button type="button" className={styles.parentLink}>
              My drive
            </button>
            <Icon
              d={iconsWithPaths.chev}
              size={14}
              style={{ color: "var(--muted-foreground)" }}
            />
            <span>{inFolder}</span>
            <Icon
              d={iconsWithPaths.chevDown}
              size={14}
              style={{ color: "var(--muted-foreground)" }}
            />
          </>
        ) : (
          <>
            <span>My drive</span>
            <Icon
              d={iconsWithPaths.chevDown}
              size={14}
              style={{ color: "var(--muted-foreground)" }}
            />
          </>
        )}
      </div>
      <div className={styles.actions}>
        <Btn variant="ghost" size="icon" icon={iconsWithPaths.list} />
        <Btn variant="ghost" size="icon" icon={iconsWithPaths.grid} />
        <span className={styles.divider} />
        <Btn variant="ghost" size="icon" icon={iconsWithPaths.settings} />
      </div>
    </div>
  );
}
