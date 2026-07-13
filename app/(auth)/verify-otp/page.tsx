import { Suspense } from 'react';
import VerifyOtpPage from '@/components/authPages/PhoneNumberLogin/VerifyOtpPage';

export default async function () {
  return (
    <Suspense fallback={null}>
      <VerifyOtpPage />
    </Suspense>
  );
}
