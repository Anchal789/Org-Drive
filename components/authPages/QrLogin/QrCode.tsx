'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  useActionState,
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCountdown } from '@/hooks/use-countdown';
import { postData } from '@/lib/api-fn';
import {
  finalizeLoginInternal,
  qrLogin,
  qrStart,
} from '@/services/auth-service';
import { useAuthStore } from '@/store/store';
import styles from './QrCode.module.scss';

const POLL_INTERVAL_MS = 2000;

type AuthState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'expired'; loginId: string }
  | { status: 'waiting'; loginId: string; qrDataUrl: string; expiresAt: number }
  | { status: 'needs_password'; loginId: string; passwordHint: string | null }
  | { status: 'success'; firstName: string | null };

export default function QrCode() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ status: 'loading' });
  const startedRef = useRef(false);

  const { formatted } = useCountdown(
    state.status === 'waiting' ? state.expiresAt : null,
  );

  const start = useCallback(async () => {
    setState({ status: 'loading' });

    try {
      const response = await qrStart();
      const data = response?.data;

      if (!response.success) {
        setState({
          status: 'error',
          message: response.message ?? 'Failed to start',
        });
        return;
      }

      setState({
        status: 'waiting',
        loginId: data.loginId,
        qrDataUrl: data.qrDataUrl,
        expiresAt: data.expiresAt,
      });

      window.history.replaceState(
        null,
        '',
        `/qr-login?loginId=${encodeURIComponent(data.loginId)}`,
      );
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setState({ status: 'error', message: errMsg ?? 'Network error' });
    }
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    start();
  }, [start]);

  const currentLoginId = 'loginId' in state ? state.loginId : null;
  const expiresAt = state.status === 'waiting' ? state.expiresAt : null;

  const navigateToMyDrive = useCallback(() => {
    router.replace('/my-drive');
  }, [router]);

  // Separate from the polling effect below: that effect's cleanup runs the
  // instant `state.status` changes (including the change to 'success' that
  // this very transition causes), which would otherwise cancel a
  // navigate-after-delay timeout stored in its own scope before it fires.
  useEffect(() => {
    if (state.status !== 'success') return;
    const id = setTimeout(() => navigateToMyDrive(), 1500);
    return () => clearTimeout(id);
  }, [state.status, navigateToMyDrive]);

  useEffect(() => {
    if (state.status !== 'waiting' || !currentLoginId) return;

    let cancelled = false;
    let timeoutId: NodeJS.Timeout;

    async function poll() {
      if (cancelled) return;
      try {
        const response = await qrLogin(currentLoginId || '');
        const data = response?.data;
        if (cancelled) return;

        if (data.step === 'waiting') {
          setState((prev) => {
            if (prev.status !== 'waiting') return prev;
            return {
              ...prev,
              qrDataUrl: data.qrDataUrl ?? prev.qrDataUrl,
              expiresAt: data.expiresAt
                ? Math.max(prev.expiresAt, data.expiresAt)
                : prev.expiresAt,
            };
          });
        } else if (data.step === 'needs_password') {
          setState({
            status: 'needs_password',
            loginId: currentLoginId || '',
            passwordHint: data.passwordHint ?? null,
          });
        } else if (data.step === 'success') {
          try {
            const finalizeResponse = await finalizeLoginInternal(
              currentLoginId || '',
            );
            if (cancelled) return;

            if (finalizeResponse.success) {
              if (finalizeResponse.data.accessToken) {
                useAuthStore
                  .getState()
                  .setAccessToken(finalizeResponse.data.accessToken);
              }
              setState({
                status: 'success',
                firstName: finalizeResponse.data.user.firstName,
              });
            } else {
              setState({
                status: 'error',
                message: finalizeResponse.message || 'Failed to save user data',
              });
            }
          } catch {
            if (!cancelled) {
              setState({
                status: 'error',
                message: 'Failed to finalize login on server',
              });
            }
          }
        } else if (data.step === 'expired') {
          setState({ status: 'expired', loginId: currentLoginId || '' });
        } else if (data.step === 'error') {
          setState({
            status: 'error',
            message: response.message ?? 'Login failed',
          });
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        if (!cancelled)
          setState({ status: 'error', message: errMsg ?? 'Poll error' });
      }

      if (!cancelled) {
        timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [state.status, currentLoginId]);

  const restart = () => {
    startedRef.current = false;
    start();
    startedRef.current = true;
  };

  const onExpire = useEffectEvent(() => {
    startedRef.current = false;
    start();
    startedRef.current = true;
  });

  useEffect(() => {
    if (expiresAt == null) return;
    const id = setTimeout(onExpire, Math.max(0, expiresAt - Date.now()));
    return () => clearTimeout(id);
  }, [expiresAt]);

  const [pwdError, submitPasswordAction, isSubmittingPassword] = useActionState(
    async (_prevState: string | null, formData: FormData) => {
      if (state.status !== 'needs_password') return null;

      const password = formData.get('password') as string;

      try {
        const response = await postData<{
          step?: string;
          error?: string;
          firstName?: string | null;
        }>({
          url: '/api/auth/qr-password',
          payload: { loginId: state.loginId, password },
          baseUrl: process.env.NEXT_PUBLIC_AUTH_API_URL,
        });

        const data = response?.data;

        if (response.success && data?.step === 'success') {
          const finalizeResponse = await finalizeLoginInternal(state.loginId);

          if (finalizeResponse.success) {
            if (finalizeResponse.data.accessToken) {
              useAuthStore
                .getState()
                .setAccessToken(finalizeResponse.data.accessToken);
            }
            setState({
              status: 'success',
              firstName: finalizeResponse.data.user.firstName,
            });
            return null;
          }
          return finalizeResponse.message || 'Failed to save user data';
        }
        return data?.error ?? 'Password failed';
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        return errMsg ?? 'Network error';
      }
    },
    null,
  );

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.qrContainer}>
          {state.status === 'loading' && (
            <Skeleton className={styles.qrImage} />
          )}

          {state.status === 'waiting' && state.qrDataUrl && (
            <Image
              src={state.qrDataUrl}
              alt='Telegram QR Login'
              width={280}
              height={280}
              className={styles.qrImage}
            />
          )}

          {state.status === 'expired' && (
            <div className={styles.stateWrapper}>
              <p className={styles.stateTitle}>QR code expired</p>
              <Button
                type='button'
                onClick={restart}
                className={styles.btnPrimary}
              >
                Regenerate QR code
              </Button>
            </div>
          )}

          {state.status === 'needs_password' && (
            <div>
              <p className={styles.passwordHintText}>
                Two-factor authentication is enabled on your Telegram account.
              </p>
              {state.passwordHint && <p>Hint: {state.passwordHint}</p>}

              <form
                action={submitPasswordAction}
                className={styles.stateWrapper}
              >
                <Input
                  className={styles.input}
                  type='password'
                  name='password'
                  required
                  placeholder='Your Telegram password'
                />
                <Button
                  type='submit'
                  disabled={isSubmittingPassword}
                  className={styles.btnPrimary}
                >
                  {isSubmittingPassword ? 'Verifying…' : 'Submit password'}
                </Button>
                {pwdError && <p className={styles.errorText}>{pwdError}</p>}
              </form>
            </div>
          )}

          {state.status === 'success' && (
            <div className={styles.stateWrapper}>
              <p className={styles.successTitle}>Welcome, {state.firstName}!</p>
              <p className={styles.successSubtitle}>Redirecting…</p>
            </div>
          )}

          {state.status === 'error' && (
            <div className={styles.stateWrapper}>
              <p className={styles.errorText}>{state.message}</p>
              <Button
                type='button'
                onClick={start}
                className={styles.btnPrimary}
              >
                Try again
              </Button>
            </div>
          )}
        </div>

        {state.status === 'waiting' && (
          <div className={styles.liveBadge}>Live</div>
        )}
      </div>

      <div className={styles.footer}>
        {state.status === 'waiting' && (
          <>
            <span className={styles.blinkDot} />
            QR expires in {formatted} · refreshes automatically
          </>
        )}
        {state.status === 'expired' && (
          <span>Code expired, click regenerate to get a new one</span>
        )}
      </div>
    </>
  );
}
