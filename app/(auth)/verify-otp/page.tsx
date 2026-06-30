import VerifyOtpPage from "@/components/authPages/PhoneNumberLogin/VerifyOtpPage";
import { Suspense } from "react";

export default async function () {
  return (
    <Suspense fallback={null}>
      <VerifyOtpPage />
    </Suspense>
  );
}
