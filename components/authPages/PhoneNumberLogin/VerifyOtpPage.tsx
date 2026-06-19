"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Icon from "@/components/ui/icon";
import TelegramButton from "@/components/ui/telegram-button";
import { iconsWithPaths } from "@/constants/common-constants";
import { decrypt } from "@/lib/utils";
import { verifyOtp, verifyOtpPassword } from "@/services/auth-service";
import styles from "./VerifyOtpPage.module.scss";

const OTP_LENGTH = 5;
const RESEND_SECONDS = 60;

type Status = "entering_otp" | "needs_password" | "success";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = decrypt(searchParams.get("phone") ?? "");

  const [status, setStatus] = useState<Status>("entering_otp");
  const [activeIndex, setActiveIndex] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [passwordHint, setPasswordHint] = useState<string | null>(null);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const otpForm = useForm<{ otp: string }>({
    defaultValues: { otp: "" },
    mode: "onChange",
  });

  const otpValue = otpForm.watch("otp");
  const digits = Array.from(
    { length: OTP_LENGTH },
    (_, i) => otpValue[i] ?? "",
  );

  const passwordForm = useForm<{ password: string }>({
    defaultValues: { password: "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (!phoneNumber) {
      router.replace("/login");
    }
  }, [phoneNumber, router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  const updateOtpDigit = (index: number, newDigit: string) => {
    const cleaned = newDigit.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    const joined = next.join("");

    otpForm.setValue("otp", joined, { shouldValidate: true });

    if (cleaned && index < OTP_LENGTH - 1) {
      setActiveIndex(index + 1);
      inputsRef.current[index + 1]?.focus();
    }

    if (cleaned && index === OTP_LENGTH - 1 && next.every((d) => d !== "")) {
      otpForm.handleSubmit(submitOtp)();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      setActiveIndex(index - 1);
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      setActiveIndex(index - 1);
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      setActiveIndex(index + 1);
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    otpForm.setValue("otp", pasted, { shouldValidate: true });
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    setActiveIndex(focusIdx);
    inputsRef.current[focusIdx]?.focus();

    if (pasted.length === OTP_LENGTH) {
      otpForm.handleSubmit(submitOtp)();
    }
  };

  async function submitOtp(values: { otp: string }) {
    setServerError(null);
    try {
      const response = await verifyOtp(String(phoneNumber), values.otp);
      const data = response?.data;

      if (response.success && data.step === "success") {
        setStatus("success");
        setTimeout(() => router.push("/my-drive"), 1000);
      } else if (response.success && data?.step === "needs_password") {
        setPasswordHint(data.passwordHint ?? null);
        setStatus("needs_password");
      } else {
        setServerError(response.message || "Invalid code");
        otpForm.setValue("otp", "");
        setActiveIndex(0);
        inputsRef.current[0]?.focus();
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setServerError(errMsg ?? "Network error");
    }
  }

  async function submitPassword(values: { password: string }) {
    setServerError(null);
    try {
      const response = await verifyOtpPassword(
        String(phoneNumber),
        values.password,
      );
      const data = response?.data;

      if (response.success && data?.step === "success") {
        setStatus("success");
        setTimeout(() => router.push("/my-drive"), 1000);
      } else {
        setServerError(response.message ?? "Incorrect password");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setServerError(errMsg ?? "Network error");
    }
  }

  const showOtpUi = status === "entering_otp";
  const showPasswordUi = status === "needs_password";

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.authCard}>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className={styles.backButton}
        >
          <Icon d={iconsWithPaths.chevLeft} size={13} /> Back
        </button>

        <div>
          <div className={styles.progressContainer}>
            {[0, 1, 2].map((i) => {
              const filledThrough = showPasswordUi ? 2 : 1;
              return (
                <span
                  key={i}
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
                    <strong className={styles.highlightText}>
                      {passwordHint}
                    </strong>
                  </>
                )}
              </>
            ) : (
              <>
                We sent a {OTP_LENGTH}-digit code to your Telegram account
                ending&nbsp;
                <strong className={styles.highlightText}>
                  •• {phoneNumber?.slice(-4)}
                </strong>
                .
              </>
            )}
          </p>
        </div>

        {showOtpUi && (
          <form
            onSubmit={otpForm.handleSubmit(submitOtp)}
            className={styles.formWrapper}
          >
            <Controller
              control={otpForm.control}
              name="otp"
              rules={{
                required: "OTP is required",
                minLength: {
                  value: OTP_LENGTH,
                  message: `OTP must be ${OTP_LENGTH} digits`,
                },
                maxLength: {
                  value: OTP_LENGTH,
                  message: `OTP must be ${OTP_LENGTH} digits`,
                },
                pattern: { value: /^\d+$/, message: "OTP must be digits only" },
              }}
              render={() => (
                <div className={styles.otpContainer}>
                  {digits.map((digit, i) => {
                    const isActive = i === activeIndex;
                    return (
                      <label
                        key={i}
                        className={`${styles.otpLabel} ${isActive ? styles.active : ""}`}
                      >
                        <input
                          ref={(el) => {
                            inputsRef.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => updateOtpDigit(i, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(i, e)}
                          onPaste={handlePaste}
                          onFocus={() => setActiveIndex(i)}
                          disabled={otpForm.formState.isSubmitting}
                          autoFocus={i === 0}
                          className={styles.otpInput}
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            />

            <div className={styles.resendContainer}>
              <Icon d={iconsWithPaths.clock} size={12} />
              {resendIn > 0 ? (
                <>
                  Resend code in{" "}
                  <span className={styles.resendTimer}>
                    {String(Math.floor(resendIn / 60)).padStart(2, "0")}:
                    {String(resendIn % 60).padStart(2, "0")}
                  </span>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setResendIn(RESEND_SECONDS)}
                  className={styles.resendButton}
                >
                  Resend code
                </button>
              )}
            </div>

            {(otpForm.formState.errors.otp || serverError) && (
              <p className={styles.errorText}>
                {otpForm.formState.errors.otp?.message ?? serverError}
              </p>
            )}

            <TelegramButton
              type="submit"
              disabled={
                otpForm.formState.isSubmitting || !otpForm.formState.isValid
              }
              loading={otpForm.formState.isSubmitting}
              loadingText="Verifying…"
            >
              Verify and continue
            </TelegramButton>
          </form>
        )}

        {showPasswordUi && (
          <form
            onSubmit={passwordForm.handleSubmit(submitPassword)}
            className={styles.passwordFormWrapper}
          >
            <Controller
              control={passwordForm.control}
              name="password"
              rules={{
                required: "Password is required",
                minLength: { value: 1, message: "Password is required" },
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="password"
                  placeholder="Your Telegram password"
                  autoFocus
                  disabled={passwordForm.formState.isSubmitting}
                  className={`${styles.passwordInput} ${passwordForm.formState.errors.password ? styles.error : ""}`}
                />
              )}
            />

            {(passwordForm.formState.errors.password || serverError) && (
              <p className={styles.errorText}>
                {passwordForm.formState.errors.password?.message ?? serverError}
              </p>
            )}

            <TelegramButton
              type="submit"
              disabled={
                passwordForm.formState.isSubmitting ||
                !passwordForm.formState.isValid
              }
              loading={passwordForm.formState.isSubmitting}
              loadingText="Verifying…"
            >
              Continue
            </TelegramButton>
          </form>
        )}
        {showOtpUi && (
          <div className={styles.helpContainer}>
            Trouble receiving codes?{" "}
            <button
              type="button"
              onClick={() => router.push("/qr-login")}
              className={styles.linkButton}
            >
              Use QR code instead →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
