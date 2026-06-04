import Icon from "@/components/ui/Icon";
import { iconsWithPaths } from "@/constants/common-constants";
import styles from "@/styles/components/DriveDropOverlay.module.scss";

export default function DriveDropOverlay() {
  return (
    <div className={styles.overlay}>
      <div className={styles.inner}>
        <div className={styles.iconBox}>
          <Icon d={iconsWithPaths.upload} size={28} stroke={2} />
        </div>
        <div className={styles.title}>Drop to upload</div>
        <div className={styles.subtitle}>
          3 files · ~14 MB · into Engineering
        </div>
      </div>
    </div>
  );
}
