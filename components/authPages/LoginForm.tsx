import styles from "./LoginPage.module.scss";
import PhoneLogin from "./PhoneNumberLogin/PhoneLogin";
import { TelegramQrDisplayPanel } from "./QrLogin/TelegramQrDisplayPanel";

export default function LoginPage() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formSection}>
        <div className={styles.formContainer}>
          {/* Header */}
          <div>
            <div className={styles.eyebrow}>Login</div>
            <h2 className={styles.title}>Welcome back.</h2>
            <p className={styles.subtitle}>
              Enter your phone — we'll send a code via Telegram.
            </p>
          </div>

          <PhoneLogin />

          {/* Divider */}
          <div className={styles.dividerWrapper}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>or scan QR</span>
            <div className={styles.dividerLine} />
          </div>

          <TelegramQrDisplayPanel />
        </div>
      </div>
    </div>
  );
}
