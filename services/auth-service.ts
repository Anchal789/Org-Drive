// services/auth.service.ts

import { fetchData, postData } from "@/lib/api-fn";
import { User } from "@/types/auth";

export async function requestOtp(phoneNumber: string) {
  const res = await postData({
    url: "/api/auth/request-otp",
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
  }>({
    url: "/api/auth/verify-otp",
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
  }>({
    url: "/api/auth/verify-otp-password",
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
    url: "/api/auth/qr-start",
    payload: {},
  });

  return res;
}

export async function qrLogin(loginId: string) {
  const res = await fetchData<{
    qrDataUrl: string;
    expiresAt: number;
    step: string;
    passwordHint: string;
    user: User;
  }>({
    url: `/api/auth/qr-login?loginId=${loginId}`,
  });

  return res;
}
