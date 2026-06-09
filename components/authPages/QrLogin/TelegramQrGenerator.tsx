"use client";

import { iconsWithPaths } from "@/constants/common-constants";
import Icon from "@/components/ui/Icon";
import QrCode from "./QrCode";
import TelegramButton from "@/components/ui/TelegramButton";
import styles from "./TelegramQrGenerator.module.scss";

export default function TelegramQrGenerator() {
  return (
    <div
      className={styles.pageWrapper}
      data-screen-label="00 Login · Centered QR"
    >
      <div className={styles.authCard}>
        <div className={styles.logoRow}>
          <div className={styles.brandSquare}>OD</div>
          <div className={styles.dividerLine} />
          <div className={styles.tgCircle}>
            <Icon d={iconsWithPaths.send} size={17} stroke={2.4} />
          </div>
        </div>

        <div className={styles.textSection}>
          <h2 className={styles.heading}>Sign in to Org Drive</h2>
          <p className={styles.subheading}>
            Scan the QR with the Telegram app, or tap the button below.
          </p>
        </div>

        <div className={styles.qrWrapper}>
          <QrCode />
        </div>

        <div className={styles.orDivider}>
          <div className={styles.orLine} />
          <span className={styles.orText}>or</span>
          <div className={styles.orLine} />
        </div>

        <TelegramButton navigateTo="/login" isNavigatingButton>
          Continue with Telegram
        </TelegramButton>

        <div className={styles.termsText}>
          By continuing you agree to the{" "}
          <span className={styles.termsLink}>Terms</span> and{" "}
          <span className={styles.termsLink}>Privacy Policy</span>.
        </div>
      </div>
    </div>
  );
}
