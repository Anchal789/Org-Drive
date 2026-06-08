import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import UserAvatar from "@/components/ui/UserAvatar";
import { iconsWithPaths } from "@/constants/common-constants";
import styles from "@/styles/components/DriveTopbar.module.scss";

export default function DriveTopbar() {
  return (
    <div className={styles.topbar}>
      <div className={styles.searchBox}>
        <Icon
          d={iconsWithPaths.search}
          size={16}
          style={{ color: "var(--muted-foreground)" }}
        />
        <span className={styles.searchPlaceholder}>Search in Org Drive</span>
        <Badge tone="violet" outline style={{ fontSize: 10 }}>
          <Icon d={iconsWithPaths.sparkle} size={9} /> Smart
        </Badge>
        <Icon
          d={iconsWithPaths.settings}
          size={14}
          style={{ color: "var(--muted-foreground)" }}
        />
      </div>
      <div className={styles.spacer} />
      <Icon
        d={iconsWithPaths.bell}
        size={18}
        style={{ color: "var(--muted-foreground)" }}
      />
      <UserAvatar initials="MK" tone="violet" size="default" ring />
    </div>
  );
}
