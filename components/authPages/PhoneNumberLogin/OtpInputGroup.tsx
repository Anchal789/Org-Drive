'use client';

import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import styles from './VerifyOtpPage.module.scss';

type OtpInputGroupProps = {
  length: number;
  value: string;
  disabled: boolean;
  onChangeAction: (otp: string) => void;
  onCompleteAction: () => void;
};

export default function OtpInputGroup({
  length,
  value,
  disabled,
  onChangeAction,
  onCompleteAction,
}: OtpInputGroupProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const cells = Array.from({ length }, (_, index) => ({
    id: `otp-cell-${index}`,
    index,
  }));
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const focusCell = (index: number) => {
    const clamped = Math.max(0, Math.min(index, length - 1));
    inputsRef.current[clamped]?.focus();
  };

  const updateDigit = (index: number, newDigit: string) => {
    const cleaned = newDigit.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    const joined = next.join('');

    onChangeAction(joined);

    if (cleaned && index < length - 1) {
      focusCell(index + 1);
    }

    if (cleaned && index === length - 1 && next.every((d) => d !== '')) {
      onCompleteAction();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      focusCell(index - 1);
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      focusCell(index - 1);
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      focusCell(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length);
    if (!pasted) return;

    onChangeAction(pasted);
    focusCell(Math.min(pasted.length, length - 1));

    if (pasted.length === length) {
      onCompleteAction();
    }
  };
  const activeIndex = Math.min(digits.indexOf(''), length - 1);
  const resolvedActiveIndex = activeIndex === -1 ? length - 1 : activeIndex;

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  return (
    <fieldset
      className={styles.otpContainer}
      aria-label={`Verification code, ${length} digits`}
    >
      {cells.map(({ id, index }) => {
        const digit = digits[index];
        const isActive = index === resolvedActiveIndex;
        return (
          <label
            key={id}
            className={`${styles.otpLabel} ${isActive ? styles.active : ''}`}
            htmlFor={id}
          >
            <Input
              id={id}
              aria-label={`Digit ${index + 1} of ${length}`}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type='text'
              inputMode='numeric'
              pattern='[0-9]*'
              maxLength={1}
              value={digit}
              onChange={(e) => updateDigit(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={disabled}
              autoFocus={index === 0}
              className={styles.otpInput}
            />
          </label>
        );
      })}
    </fieldset>
  );
}
