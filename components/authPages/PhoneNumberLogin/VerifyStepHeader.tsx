import styles from "./VerifyOtpPage.module.scss";

type VerifyStepHeaderProps = {
  showPasswordUi: boolean;
  phoneNumber: string | null;
  passwordHint: string | null;
  otpLength: number;
};

export default function VerifyStepHeader({
  showPasswordUi,
  phoneNumber,
  passwordHint,
  otpLength,
}: VerifyStepHeaderProps) {
  return (
    <div>
      <div className={styles.progressContainer}>
        {[0, 1, 2].map((i) => {
          const filledThrough = showPasswordUi ? 2 : 1;
          return (
            <span
              key={`otp-${i}`}
              className={`${styles.progressSegment} ${i <= filledThrough ? styles.active : ""}`}
            />
          );
        })}
      </div>

      <div className={styles.stepLabel}>
        {showPasswordUi
          ? "Step 3 of 3 · Two-factor authentication"
          : "Step 2 of 3 · Verify identity"}
      </div>

      <h2 className={styles.heading}>
        {showPasswordUi
          ? "Enter your Telegram password."
          : "Check Telegram for a code."}
      </h2>

      <p className={styles.description}>
        {showPasswordUi ? (
          <>
            Two-factor authentication is enabled on your account.
            {passwordHint && (
              <>
                {" "}
                Hint:{" "}
                <strong className={styles.highlightText}>{passwordHint}</strong>
              </>
            )}
          </>
        ) : (
          <>
            We sent a {otpLength}-digit code to your Telegram account
            ending&nbsp;
            <strong className={styles.highlightText}>
              •• {phoneNumber?.slice(-4)}
            </strong>
            .
          </>
        )}
      </p>
    </div>
  );
}
