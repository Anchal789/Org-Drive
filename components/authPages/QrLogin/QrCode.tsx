"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCountdown } from "@/hooks/use-countdown";
import { postData } from "@/lib/api-fn";
import { encrypt } from "@/lib/utils";
import { qrLogin, qrStart } from "@/services/auth-service";
import type { TelegramUser } from "@/types/auth";
import styles from "./QrCode.module.scss";

const POLL_INTERVAL_MS = 2000;

type AuthState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "expired"; loginId: string }
  | { status: "waiting"; loginId: string; qrDataUrl: string; expiresAt: number }
  | { status: "needs_password"; loginId: string; passwordHint: string | null }
  | { status: "success"; user: TelegramUser };

export default function QrCode() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const startedRef = useRef(false);

  const { formatted, expired } = useCountdown(
    state.status === "waiting" ? state.expiresAt : null,
  );

  const start = useCallback(async () => {
    setState({ status: "loading" });

    try {
      const response = await qrStart();
      const data = response?.data;

      if (!response.success) {
        setState({
          status: "error",
          message: response.message ?? "Failed to start",
        });
        return;
      }

      setState({
        status: "waiting",
        loginId: data.loginId,
        qrDataUrl: data.qrDataUrl,
        expiresAt: data.expiresAt,
      });

      const encryptedLoginId = encrypt(data.loginId);
      window.history.replaceState(
        null,
        "",
        `/qr-login?loginId=${encryptedLoginId}`,
      );
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setState({ status: "error", message: errMsg ?? "Network error" });
    }
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    start();
  }, [start]);

  useEffect(() => {
    if (state.status !== "waiting") return;

    let cancelled = false;
    const currentLoginId = state.loginId;

    async function poll() {
      if (cancelled) return;
      try {
        const response = await qrLogin(currentLoginId);
        const data = response?.data;
        if (cancelled) return;

        if (data.step === "waiting") {
          setState((prev) => {
            if (prev.status !== "waiting") return prev;
            return {
              ...prev,
              qrDataUrl: data.qrDataUrl ?? prev.qrDataUrl,
              expiresAt: data.expiresAt ?? prev.expiresAt,
            };
          });
        } else if (data.step === "needs_password") {
          setState({
            status: "needs_password",
            loginId: currentLoginId,
            passwordHint: data.passwordHint ?? null,
          });
        } else if (data.step === "success" && data.user) {
          setState({ status: "success", user: data.user });
          setTimeout(() => router.push("/my-drive"), 1500);
        } else if (data.step === "expired") {
          setState({ status: "expired", loginId: currentLoginId });
        } else if (data.step === "error") {
          setState({
            status: "error",
            message: response.message ?? "Login failed",
          });
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        if (!cancelled)
          setState({ status: "error", message: errMsg ?? "Poll error" });
      }
    }

    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [state.status, router]);

  function restart() {
    startedRef.current = false;
    start();
    startedRef.current = true;
  }

  useEffect(() => {
    if (expired && state.status === "waiting") {
      setState({ status: "expired", loginId: state.loginId });
      restart();
    }
  }, [expired, state.status]);

  const [pwdError, submitPasswordAction, isSubmittingPassword] = useActionState(
    async (prevState: string | null, formData: FormData) => {
      if (state.status !== "needs_password") return null;

      const password = formData.get("password") as string;

      try {
        const response = await postData<{
          step?: string;
          error?: string;
          user?: TelegramUser;
        }>({
          url: "/api/auth/qr-password",
          payload: { loginId: state.loginId, password },
        });

        const data = response?.data;

        if (response.success && data?.step === "success" && data.user) {
          setState({ status: "success", user: data.user });
          setTimeout(() => router.push("/my-drive"), 1500);
          return null;
        }
        return data?.error ?? "Password failed";
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        return errMsg ?? "Network error";
      }
    },
    null,
  );

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.qrContainer}>
          {state.status === "loading" && <div className={styles.skeleton} />}

          {state.status === "waiting" && state.qrDataUrl && (
            <Image
              src={state.qrDataUrl}
              alt="Telegram QR Login"
              width={280}
              height={280}
            />
          )}

          {state.status === "expired" && (
            <div className={styles.stateWrapper}>
              <p className={styles.stateTitle}>QR code expired</p>
              <button
                type="button"
                onClick={restart}
                className={styles.btnPrimary}
              >
                Regenerate QR code
              </button>
            </div>
          )}

          {state.status === "needs_password" && (
            <div>
              <p className={styles.passwordHintText}>
                Two-factor authentication is enabled on your Telegram account.
              </p>
              {state.passwordHint && <p>Hint: {state.passwordHint}</p>}

              <form
                action={submitPasswordAction}
                className={styles.stateWrapper}
              >
                <input
                  className={styles.input}
                  type="password"
                  name="password"
                  autoFocus
                  required
                  placeholder="Your Telegram password"
                />
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className={styles.btnPrimary}
                >
                  {isSubmittingPassword ? "Verifying…" : "Continue"}
                </button>
                {pwdError && <p className={styles.errorText}>{pwdError}</p>}
              </form>
            </div>
          )}

          {state.status === "success" && (
            <div className={styles.stateWrapper}>
              <p className={styles.successTitle}>
                Welcome, {state.user.firstName}!
              </p>
              <p className={styles.successSubtitle}>Redirecting…</p>
            </div>
          )}

          {state.status === "error" && (
            <div className={styles.stateWrapper}>
              <p className={styles.errorText}>{state.message}</p>
              <button
                type="button"
                onClick={start}
                className={styles.btnPrimary}
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {state.status === "waiting" && (
          <div className={styles.liveBadge}>Live</div>
        )}
      </div>

      <div className={styles.footer}>
        {state.status === "waiting" && (
          <>
            <span className={styles.blinkDot} />
            QR expires in {formatted} · refreshes automatically
          </>
        )}
        {state.status === "expired" && (
          <span>Code expired — click regenerate to get a new one</span>
        )}
      </div>
    </>
  );
}
