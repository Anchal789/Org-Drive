'use client';

import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AsyncButton } from '@/components/ui/async-button';
import { iconsWithPaths } from '@/constants/common-constants';
import styles from './VerifyOtpPage.module.scss';

type ResendTimerProps = {
  seconds: number;
  onResend: () => unknown | Promise<unknown>;
};

const remainingFrom = (deadline: number) =>
  Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

export default function ResendTimer({ seconds, onResend }: ResendTimerProps) {
  const [deadline, setDeadline] = useState(() => Date.now() + seconds * 1000);
  const [resendIn, setResendIn] = useState(() => remainingFrom(deadline));

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn(remainingFrom(deadline)), 1000);
    return () => clearInterval(id);
  }, [resendIn, deadline]);

  const handleResend = async () => {
    await onResend();
    const next = Date.now() + seconds * 1000;
    setDeadline(next);
    setResendIn(remainingFrom(next));
  };

  return (
    <div className={styles.resendContainer}>
      <Clock d={iconsWithPaths.clock} size={12} />
      {resendIn > 0 ? (
        <>
          Resend code in{' '}
          <span className={styles.resendTimer}>
            {String(Math.floor(resendIn / 60)).padStart(2, '0')}:
            {String(resendIn % 60).padStart(2, '0')}
          </span>
        </>
      ) : (
        <AsyncButton
          type='button'
          onClick={handleResend}
          className={styles.resendButton}
        >
          Resend code
        </AsyncButton>
      )}
    </div>
  );
}
