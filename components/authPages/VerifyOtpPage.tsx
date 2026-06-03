// app/(auth)/verify-otp/page.tsx (or wherever it lives)
"use client";

import { iconsWithPaths, TG_BLUE } from "@/constants/common-constants";
import Icon from "../ui/Icon";
import TelegramButton from "../ui/TelegramButton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  // 2FA state
  const [password, setPassword] = useState("");
  const [passwordHint, setPasswordHint] = useState<string | null>(null);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Bail out if no phone number — redirect back to phone entry
  useEffect(() => {
    if (!phoneNumber) {
      router.replace("/login");
    }
  }, [phoneNumber, router]);

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  // ─── OTP input handling ───────────────────────────────────────────────────
  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(-1); // last digit only
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);

    if (cleaned && index < OTP_LENGTH - 1) {
      setActiveIndex(index + 1);
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (cleaned && index === OTP_LENGTH - 1 && next.every((d) => d !== "")) {
      submitOtp(next.join(""));
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
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    setActiveIndex(focusIdx);
    inputsRef.current[focusIdx]?.focus();
    if (pasted.length === OTP_LENGTH) {
      submitOtp(pasted);
    }
  };

  // ─── Submission ───────────────────────────────────────────────────────────
  async function submitOtp(code: string) {
    setStatus("submitting");
    setError(null);
    try {
      const data = await verifyOtp(phoneNumber, code);

      if (data.success && data.status === "success") {
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 1000);
      } else if (data.success && data.status === "needs_password") {
        setPasswordHint(data.passwordHint ?? null);
        setStatus("needs_password");
      } else {
        setStatus("entering_otp");
        setError(data.error ?? "Invalid code");
        setDigits(Array(OTP_LENGTH).fill(""));
        setActiveIndex(0);
        inputsRef.current[0]?.focus();
      }
    } catch (e: any) {
      setStatus("entering_otp");
      setError(e?.message ?? "Network error");
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setStatus("submitting");
    setError(null);
    try {
      const data = await verifyOtpPassword(phoneNumber, password);

      if (data.success && data.status === "success") {
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        setStatus("needs_password");
        setError(data.error ?? "Incorrect password");
      }
    } catch (e: any) {
      setStatus("needs_password");
      setError(e?.message ?? "Network error");
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

        {/* Step header */}
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
          <>
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
                      background: active
                        ? "var(--background)"
                        : "var(--background)",
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
                      onChange={(e) => handleDigitChange(i, e.target.value)}
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
                      }}
                    />
                    {active && !digit && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: 12,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 2,
                          height: 22,
                          background: TG_BLUE,
                          animation: "blink 1s steps(2) infinite",
                          pointerEvents: "none",
                        }}
                      />
                    )}
                  </label>
                );
              })}
            </div>

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
                    // TODO: call requestOtp(phoneNumber) again
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

            {error && (
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "var(--destructive)",
                  textAlign: "center",
                }}
              >
                {error}
              </p>
            )}

            <TelegramButton
              type="button"
              disabled={status === "submitting" || digits.some((d) => !d)}
              onClick={() => submitOtp(digits.join(""))}
            >
              {status === "submitting" ? "Verifying…" : "Verify and continue"}
            </TelegramButton>
          </>
        )}

        {/* 2FA password form */}
        {showPasswordUi && (
          <form
            onSubmit={submitPassword}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your Telegram password"
              autoFocus
              required
              style={{
                padding: "12px 14px",
                background: "var(--background)",
                color: "var(--foreground)",
                border: "1.5px solid var(--input)",
                borderRadius: "var(--radius-lg)",
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            {error && (
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "var(--destructive)",
                  textAlign: "center",
                }}
              >
                {error}
              </p>
            )}
            <TelegramButton type="submit" disabled={!password}>
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
