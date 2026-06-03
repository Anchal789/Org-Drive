// services/auth.service.ts

export async function requestOtp(phoneNumber: string) {
  const res = await fetch('/api/auth/request-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber }),
  });

  return res.json();
}

export async function verifyOtp(phoneNumber: string, otpCode: string) {
  const res = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phoneNumber,
      otpCode,
    }),
  });

  return res.json();
}

export async function qrStart() {
  const res = await fetch('/api/auth/qr-start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res.json();
}

export async function qrLogin(loginId: string) {
  const res = await fetch(`/api/auth/qr-login?loginId=${loginId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res.json();
}
