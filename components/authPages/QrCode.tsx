"use client";

import { encrypt } from "@/lib/utils";
import { useCountdown } from "@/hooks/use-countdown";
import { QRLoginStatus, TelegramUser } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { TG_BLUE, TG_BLUE_BG, TINTS } from "@/constants/common-constants";
import Image from "next/image";
import { qrLogin, qrStart } from "@/services/auth-service";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const POLL_INTERVAL_MS = 2000;

export default function QrCode() {
  const router = useRouter();
  const [status, setStatus] = useState<QRLoginStatus>("loading");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordHint, setPasswordHint] = useState<string | null>(null);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const loginIdRef = useRef<string | null>(null);
  const startedRef = useRef(false);

  const { formatted, expired } = useCountdown(expiresAt);

  const start = useCallback(async () => {
    setStatus("loading");
    setQrDataUrl(null);
    setExpiresAt(null);
    setError(null);
    setUser(null);
    setPasswordHint(null);
    loginIdRef.current = null;

    try {
      const data = await qrStart();

      if (!data.success) {
        setStatus("error");
        setError(data.error ?? "Failed to start");
        return;
      }

      loginIdRef.current = data.loginId;
      setQrDataUrl(data.qrDataUrl);
      setExpiresAt(data.expiresAt);
      setStatus("waiting");

      const encryptedLoginId = encrypt(data.loginId);
      window.history.replaceState(
        null,
        "",
        `/qr-login?loginId=${encryptedLoginId}`,
      );
    } catch (e: any) {
      setStatus("error");
      setError(e?.message ?? "Network error");
    }
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    start();
  }, [start]);

  useEffect(() => {
    if (status !== "waiting" || !loginIdRef.current) return;

    let cancelled = false;

    async function poll() {
      if (cancelled) return;
      try {
        const data = await qrLogin(loginIdRef.current ?? "");
        if (cancelled) return;

        if (data.status === "waiting") {
          if (data.qrDataUrl) setQrDataUrl(data.qrDataUrl);
          if (data.expiresAt) setExpiresAt(data.expiresAt);
        } else if (data.status === "needs_password") {
          setStatus("needs_password");
          setPasswordHint(data.passwordHint ?? null);
          setError(null);
        } else if (data.status === "success") {
          setUser(data.user);
          setStatus("success");
          setTimeout(() => router.push("/dashboard"), 1500);
        } else if (data.status === "expired") {
          setStatus("expired");
        } else if (data.status === "error") {
          setStatus("error");
          setError(data.error ?? "Login failed");
        }
      } catch (e: any) {
        if (!cancelled) {
          setStatus("error");
          setError(e?.message ?? "Poll error");
        }
      }
    }

    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [status, router]);

  function restart() {
    startedRef.current = false;
    start();
    startedRef.current = true;
  }

  async function submitPassword(password: string) {
    setSubmittingPassword(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/qr-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: loginIdRef.current, password }),
      });
      const data = await res.json();

      if (data.success && data.status === "success") {
        setUser(data.user);
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setError(data.error ?? "Password failed");
      }
    } catch (e: any) {
      setError(e?.message ?? "Network error");
    } finally {
      setSubmittingPassword(false);
    }
  }

  useEffect(() => {
    if (expired && status === "waiting") {
      setStatus("expired");
      restart();
    }
  }, [expired, status]);

  return (
    <>
      <div style={{ position: "relative" }}>
        <div
          style={{
            width: 280,
            height: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 14,
          }}
        >
          {status === "loading" && (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "var(--muted)",
                borderRadius: "0.625rem",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          )}

          {status === "waiting" && qrDataUrl && (
            <Image
              src={qrDataUrl}
              alt="Telegram QR Login"
              width={280}
              height={280}
            />
          )}
          {status === "expired" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                textAlign: "center",
                color: "var(--muted-foreground)",
              }}
            >
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                QR code expired
              </p>
              <button
                type="button"
                onClick={restart}
                style={{
                  padding: "8px 16px",
                  background: TG_BLUE,
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Regenerate QR code
              </button>
            </div>
          )}

          {status === "needs_password" && (
            <div>
              <p
                style={{
                  textAlign: "center",
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--muted-foreground)",
                  marginBottom: 12,
                }}
              >
                Two-factor authentication is enabled on your Telegram account.
              </p>
              {passwordHint && <p>Hint: {passwordHint}</p>}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const password = new FormData(e.currentTarget).get(
                    "password",
                  ) as string;
                  submitPassword(password);
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  textAlign: "center",
                  color: "var(--muted-foreground)",
                }}
              >
                <Input
                  type="password"
                  name="password"
                  autoFocus
                  required
                  placeholder="Your Telegram password"
                  style={{
                    padding: "8px 16px",
                    background: "var(--muted)",
                    color: "var(--foreground)",
                    borderRadius: "var(--radius-md)",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                />
                <Button
                  type="submit"
                  disabled={submittingPassword}
                  style={{
                    padding: "8px 16px",
                    background: TG_BLUE,
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {submittingPassword ? "Verifying…" : "Continue"}
                </Button>
                {error && (
                  <p style={{ color: "var(--destructive)" }}>{error}</p>
                )}
              </form>
            </div>
          )}

          {status === "success" && user && (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "var(--foreground)" }}>
                Welcome, {user.firstName}!
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                  margin: 0,
                }}
              >
                Redirecting…
              </p>
            </div>
          )}

          {status === "error" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                textAlign: "center",
              }}
            >
              <p
                style={{ margin: 0, fontSize: 13, color: "var(--destructive)" }}
              >
                {error ?? "Something went wrong"}
              </p>
              <button
                type="button"
                onClick={start}
                style={{
                  padding: "8px 16px",
                  background: TG_BLUE,
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {status === "waiting" && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              padding: "2px 6px",
              background: TG_BLUE_BG,
              color: TG_BLUE,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.06em",
              borderRadius: 4,
              textTransform: "uppercase",
            }}
          >
            Live
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: 11,
          color: "var(--muted-foreground)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          marginTop: 12,
        }}
      >
        {status === "waiting" && (
          <>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: TINTS.green.bd,
                animation: "blink 1.4s steps(2) infinite",
              }}
            />
            QR expires in {formatted} · refreshes automatically
          </>
        )}
        {status === "expired" && (
          <span>Code expired — click regenerate to get a new one</span>
        )}
      </div>
    </>
  );
}
