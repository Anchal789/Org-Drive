"use client";

import { iconsWithPaths, TG_BLUE } from "@/constants/common-constants";
import Icon from "../ui/Icon";
import TelegramButton from "../ui/TelegramButton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { verifyOtp, verifyOtpPassword } from "@/services/auth-service";
import { decrypt } from "@/lib/utils";

const OTP_LENGTH = 5;
const RESEND_SECONDS = 60;

type Status =
  | "entering_otp"
  | "needs_password"
  | "submitting"
  | "success"
  | "error";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = decrypt(searchParams.get("phone") ?? "");

  const [status, setStatus] = useState<Status>("entering_otp");
  const [activeIndex, setActiveIndex] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [passwordHint, setPasswordHint] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const otpForm = useForm<{
    otp: string;
  }>({
    defaultValues: { otp: "" },
    mode: "onChange",
  });

  const otpValue = otpForm.watch("otp");
  const digits = Array.from(
    { length: OTP_LENGTH },
    (_, i) => otpValue[i] ?? "",
  );

  const passwordForm = useForm<{
    password: string;
  }>({
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
    setStatus("submitting");
    setServerError(null);
    try {
      const data = await verifyOtp(phoneNumber, values.otp);

      if (data.success && data.status === "success") {
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 1000);
      } else if (data.success && data.status === "needs_password") {
        setPasswordHint(data.passwordHint ?? null);
        setStatus("needs_password");
      } else {
        setStatus("entering_otp");
        setServerError(data.error ?? "Invalid code");
        otpForm.setValue("otp", "");
        setActiveIndex(0);
        inputsRef.current[0]?.focus();
      }
    } catch (e: any) {
      setStatus("entering_otp");
      setServerError(e?.message ?? "Network error");
    }
  }

  async function submitPassword(values: { password: string }) {
    setStatus("submitting");
    setServerError(null);
    setIsSubmitting(true);
    try {
      const data = await verifyOtpPassword(phoneNumber, values.password);

      if (data.success && data.status === "success") {
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        setStatus("needs_password");
        setServerError(data.error ?? "Incorrect password");
      }
    } catch (e: any) {
      setStatus("needs_password");
      setServerError(e?.message ?? "Network error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const showOtpUi = status === "entering_otp" || status === "submitting";
  const showPasswordUi = status === "needs_password";

  return (
    <div
      style={{
        height: "100dvh",
        background: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "var(--font-sans)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
      data-screen-label="00 Login · OTP step"
    >
      <div
        style={{
          width: 460,
          padding: 36,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-2xl)",
          boxShadow: "var(--shadow-xl)",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            alignSelf: "flex-start",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "var(--muted-foreground)",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          <Icon d={iconsWithPaths.chevLeft} size={13} /> Back
        </button>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {[0, 1, 2].map((i) => {
              const filledThrough = showPasswordUi ? 2 : 1;
              return (
                <span
                  key={i}
                  style={{
                    height: 4,
                    flex: 1,
                    borderRadius: 999,
                    background:
                      i <= filledThrough ? TG_BLUE : "var(--secondary)",
                  }}
                />
              );
            })}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--muted-foreground)",
              marginTop: 8,
              fontWeight: 500,
            }}
          >
            {showPasswordUi
              ? "Step 3 of 3 · Two-factor authentication"
              : "Step 2 of 3 · Verify identity"}
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 600,
              margin: "8px 0 6px",
              letterSpacing: "-0.02em",
            }}
          >
            {showPasswordUi
              ? "Enter your Telegram password."
              : "Check Telegram for a code."}
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--muted-foreground)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {showPasswordUi ? (
              <>
                Two-factor authentication is enabled on your account.
                {passwordHint && (
                  <>
                    {" "}
                    Hint:{" "}
                    <strong style={{ color: "var(--foreground)" }}>
                      {passwordHint}
                    </strong>
                  </>
                )}
              </>
            ) : (
              <>
                We sent a {OTP_LENGTH}-digit code to your Telegram account
                ending&nbsp;
                <strong style={{ color: "var(--foreground)" }}>
                  •• {phoneNumber.slice(-4)}
                </strong>
                .
              </>
            )}
          </p>
        </div>

        {/* OTP boxes */}
        {showOtpUi && (
          <form
            onSubmit={otpForm.handleSubmit(submitOtp)}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
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
                pattern: {
                  value: /^\d+$/,
                  message: "OTP must be digits only",
                },
              }}
              render={() => (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "center",
                    padding: "8px 0",
                  }}
                >
                  {digits.map((digit, i) => {
                    const active = i === activeIndex;
                    return (
                      <label
                        key={i}
                        style={{
                          width: 56,
                          height: 64,
                          border: `1.5px solid ${active ? TG_BLUE : "var(--input)"}`,
                          borderRadius: "var(--radius-lg)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 26,
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums",
                          background: "var(--background)",
                          boxShadow: active ? `0 0 0 3px ${TG_BLUE}33` : "none",
                          color: "var(--foreground)",
                          position: "relative",
                          cursor: "text",
                          transition: "all 150ms ease",
                        }}
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
                          disabled={status === "submitting"}
                          autoFocus={i === 0}
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            textAlign: "center",
                            fontSize: 26,
                            fontWeight: 600,
                            fontVariantNumeric: "tabular-nums",
                            color: "var(--foreground)",
                            fontFamily: "inherit",
                            caretColor: TG_BLUE,
                          }}
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            />

            {/* Resend */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: 12,
                color: "var(--muted-foreground)",
              }}
            >
              <Icon d={iconsWithPaths.clock} size={12} />
              {resendIn > 0 ? (
                <>
                  Resend code in{" "}
                  <span
                    style={{
                      color: "var(--foreground)",
                      fontWeight: 500,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {String(Math.floor(resendIn / 60)).padStart(2, "0")}:
                    {String(resendIn % 60).padStart(2, "0")}
                  </span>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setResendIn(RESEND_SECONDS);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: TG_BLUE,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Resend code
                </button>
              )}
            </div>

            {(otpForm.formState.errors.otp || serverError) && (
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "var(--destructive)",
                  textAlign: "center",
                }}
              >
                {otpForm.formState.errors.otp?.message ?? serverError}
              </p>
            )}

            <TelegramButton
              type="submit"
              disabled={status === "submitting" || !otpForm.formState.isValid}
              loading={status === "submitting"}
              loadingText="Verifying…"
            >
              Verify and continue
            </TelegramButton>
          </form>
        )}

        {/* 2FA password form */}
        {showPasswordUi && (
          <form
            onSubmit={passwordForm.handleSubmit(submitPassword)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <Controller
              control={passwordForm.control}
              name="password"
              rules={{
                required: "Password is required",
                minLength: {
                  value: 1,
                  message: "Password is required",
                },
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="password"
                  placeholder="Your Telegram password"
                  autoFocus
                  style={{
                    padding: "12px 14px",
                    background: "var(--background)",
                    color: "var(--foreground)",
                    border: `1.5px solid ${
                      passwordForm.formState.errors.password
                        ? "var(--destructive)"
                        : "var(--input)"
                    }`,
                    borderRadius: "var(--radius-lg)",
                    fontSize: 14,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
              )}
            />

            {(passwordForm.formState.errors.password || serverError) && (
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "var(--destructive)",
                  textAlign: "center",
                }}
              >
                {passwordForm.formState.errors.password?.message ?? serverError}
              </p>
            )}

            <TelegramButton
              type="submit"
              disabled={isSubmitting || !passwordForm.formState.isValid}
              loading={isSubmitting}
              loadingText="Verifying…"
            >
              Continue
            </TelegramButton>
          </form>
        )}

        {showOtpUi && (
          <div
            style={{
              fontSize: 11,
              color: "var(--muted-foreground)",
              textAlign: "center",
            }}
          >
            Trouble receiving codes?{" "}
            <button
              type="button"
              onClick={() => router.push("/qr-login")}
              style={{
                background: "none",
                border: "none",
                color: TG_BLUE,
                fontWeight: 500,
                cursor: "pointer",
                fontSize: 11,
              }}
            >
              Use QR code instead →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
