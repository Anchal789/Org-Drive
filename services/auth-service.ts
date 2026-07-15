import { postData } from '@/lib/api-fn';
import type { TelegramUser, User } from '@/types/auth';

const AUTH_SERVER_URL = process.env.NEXT_PUBLIC_AUTH_API_URL;

export async function requestOtp(phoneNumber: string) {
  const res = await postData({
    url: '/api/auth/request-otp',
    payload: {
      phoneNumber,
    },
  });

  return res;
}

export async function verifyOtp(phoneNumber: string, otpCode: string) {
  const res = await postData<{
    step?: string;
    passwordHint?: string;
    user?: User;
    accessToken?: string;
  }>({
    url: '/api/auth/verify-otp',
    payload: {
      phoneNumber,
      otpCode,
    },
  });

  return res;
}

export async function verifyOtpPassword(phoneNumber: string, password: string) {
  const res = await postData<{
    step?: string;
    passwordHint?: string;
    user?: User;
    accessToken?: string;
  }>({
    url: '/api/auth/verify-otp-password',
    payload: {
      phoneNumber,
      password,
    },
  });

  return res;
}

export async function qrStart() {
  const res = await postData<{
    loginId: string;
    qrDataUrl: string;
    expiresAt: number;
  }>({
    url: '/api/auth/qr-start',
    payload: {},
    baseUrl: AUTH_SERVER_URL,
  });

  return res;
}

export async function qrLogin(loginId: string) {
  const res = await postData<{
    qrDataUrl: string;
    expiresAt: number;
    step: string;
    passwordHint: string;
    user: User;
    accessToken?: string;
  }>({
    url: `/api/auth/qr-login?loginId=${loginId}`,
    payload: {},
    baseUrl: AUTH_SERVER_URL,
  });

  return res;
}

export async function finalizeLoginInternal(telegramUser: TelegramUser) {
  const response = await postData<{ accessToken: string }>({
    url: '/api/auth/finalize-login',
    payload: { user: telegramUser },
    baseUrl: AUTH_SERVER_URL,
  });
  return response;
}
