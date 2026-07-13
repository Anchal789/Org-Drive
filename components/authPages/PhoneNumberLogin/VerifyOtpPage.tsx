'use client';

import { ChevronLeftIcon, Shield } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useReducer } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TelegramButton from '@/components/ui/telegram-button';
import { decrypt } from '@/lib/utils';
import { verifyOtp, verifyOtpPassword } from '@/services/auth-service';
import { useAuthStore } from '@/store/store';
import OtpInputGroup from './OtpInputGroup';
import ResendTimer from './ResendTimer';
import styles from './VerifyOtpPage.module.scss';
import VerifyStepHeader from './VerifyStepHeader';
import { initialVerifyState, verifyReducer } from './verify-otp-reducer';

const OTP_LENGTH = 5;
const RESEND_SECONDS = 60;

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = decrypt(searchParams.get('phone') ?? '');

  const [state, dispatch] = useReducer(verifyReducer, initialVerifyState);
  const { status, serverError, passwordHint } = state;

  const otpForm = useForm<{ otp: string }>({
    defaultValues: { otp: '' },
    mode: 'onChange',
  });

  const passwordForm = useForm<{ password: string }>({
    defaultValues: { password: '' },
    mode: 'onChange',
  });

  if (!phoneNumber) {
    router.replace('/login');
  }

  async function submitOtp(values: { otp: string }) {
    dispatch({ type: 'submit_start' });
    try {
      const response = await verifyOtp(String(phoneNumber), values.otp);
      const data = response?.data;

      if (response.success && data.step === 'success') {
        if (data.accessToken) {
          useAuthStore.getState().setAccessToken(data.accessToken);
        }
        dispatch({ type: 'success' });
        setTimeout(() => router.replace('/my-drive'), 1000);
      } else if (response.success && data?.step === 'needs_password') {
        dispatch({
          type: 'needs_password',
          passwordHint: data.passwordHint ?? null,
        });
      } else {
        dispatch({
          type: 'error',
          message: response.message || 'Invalid code',
        });
        otpForm.setValue('otp', '');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      dispatch({ type: 'error', message: errMsg ?? 'Network error' });
    }
  }

  async function submitPassword(values: { password: string }) {
    dispatch({ type: 'submit_start' });
    try {
      const response = await verifyOtpPassword(
        String(phoneNumber),
        values.password,
      );
      const data = response?.data;

      if (response.success && data?.step === 'success') {
        if (data.accessToken) {
          useAuthStore.getState().setAccessToken(data.accessToken);
        }
        dispatch({ type: 'success' });
        setTimeout(() => router.replace('/my-drive'), 1000);
      } else {
        dispatch({
          type: 'error',
          message: response.message ?? 'Incorrect password',
        });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      dispatch({ type: 'error', message: errMsg ?? 'Network error' });
    }
  }

  const showOtpUi = status === 'entering_otp';
  const showPasswordUi = status === 'needs_password';
  const isSuccess = status === 'success';

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.authCard}>
        {!isSuccess && (
          <Button
            type='button'
            variant='ghost'
            onClick={() => router.push('/login')}
            className={styles.backButton}
          >
            <ChevronLeftIcon size={14} strokeWidth={1.6} /> Back
          </Button>
        )}

        <VerifyStepHeader
          showPasswordUi={showPasswordUi}
          isSuccess={isSuccess}
          phoneNumber={phoneNumber}
          passwordHint={passwordHint}
          otpLength={OTP_LENGTH}
        />

        {showOtpUi && (
          <form
            onSubmit={otpForm.handleSubmit(submitOtp)}
            className={styles.formWrapper}
          >
            <Controller
              control={otpForm.control}
              name='otp'
              rules={{
                required: 'OTP is required',
                minLength: {
                  value: OTP_LENGTH,
                  message: `OTP must be ${OTP_LENGTH} digits`,
                },
                maxLength: {
                  value: OTP_LENGTH,
                  message: `OTP must be ${OTP_LENGTH} digits`,
                },
                pattern: { value: /^\d+$/, message: 'OTP must be digits only' },
              }}
              render={({ field }) => (
                <OtpInputGroup
                  length={OTP_LENGTH}
                  value={field.value}
                  disabled={otpForm.formState.isSubmitting}
                  onChangeAction={(otp: string) =>
                    otpForm.setValue('otp', otp, { shouldValidate: true })
                  }
                  onCompleteAction={() => otpForm.handleSubmit(submitOtp)()}
                />
              )}
            />

            <div className={styles.resendWrapper}>
              <ResendTimer seconds={RESEND_SECONDS} />
            </div>

            {(otpForm.formState.errors.otp || serverError) && (
              <p className={styles.errorText}>
                {otpForm.formState.errors.otp?.message ?? serverError}
              </p>
            )}

            <TelegramButton
              type='submit'
              disabled={
                otpForm.formState.isSubmitting || !otpForm.formState.isValid
              }
              loading={otpForm.formState.isSubmitting}
              loadingText='Verifying…'
              className={styles.submitButton}
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
              name='password'
              rules={{
                required: 'Password is required',
                minLength: { value: 1, message: 'Password is required' },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type='password'
                  placeholder='Your Telegram password'
                  disabled={passwordForm.formState.isSubmitting}
                  className={`${styles.passwordInput} ${passwordForm.formState.errors.password ? styles.error : ''}`}
                />
              )}
            />

            {(passwordForm.formState.errors.password || serverError) && (
              <p className={styles.errorText}>
                {passwordForm.formState.errors.password?.message ?? serverError}
              </p>
            )}

            <TelegramButton
              type='submit'
              disabled={
                passwordForm.formState.isSubmitting ||
                !passwordForm.formState.isValid
              }
              loading={passwordForm.formState.isSubmitting}
              loadingText='Verifying…'
              className={styles.submitButton}
            >
              Submit password
            </TelegramButton>
          </form>
        )}

        {showOtpUi && (
          <div className={styles.helpContainer}>
            Trouble receiving codes?{' '}
            <Button
              type='button'
              onClick={() => router.push('/qr-login')}
              className={styles.linkButton}
            >
              Use QR code instead →
            </Button>
          </div>
        )}
      </div>

      <div className={styles.mobileFooter}>
        <Shield size={11} strokeWidth={1.6} /> Telegram handles the code — we
        never see it.
      </div>
    </div>
  );
}
