'use client';
import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import TgButton from '@/components/ui/TelegramButton';
import QR from '@/components/ui/TelegramQR';
import { iconsWithPaths, TINTS } from '@/constants/common-constants';

export default function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState('');

  const requestOtp = async () => {
    if (!phoneNumber) return alert('Please enter a phone number.');

    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (data.success) {
        const verifyOtp = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          body: JSON.stringify({ phoneNumber, otpCode: '222222' }),
          headers: { 'Content-Type': 'application/json' },
        });
        const verifyData = await verifyOtp.json();

        if (verifyData.success) {
          alert('Logged in successfully!');
        } else {
          alert(`Failed to verify OTP: ${verifyData.error}`);
        }
      } else {
        alert(`Failed to send OTP: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during login.');
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col lg:flex-row bg-background text-foreground font-sans"
      data-screen-label="00 Login · Split hero"
    >
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-95 flex flex-col gap-4.5">
          {/* Header */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-blue">
              Login
            </div>
            <h2 className="text-[26px] font-semibold mt-1 mb-1.5 tracking-[-0.02em]">
              Welcome back.
            </h2>
            <p className="text-[13px] text-muted-foreground m-0">
              Enter your phone — we'll send a code via Telegram.
            </p>
          </div>

          {/* Phone input */}
          <div>
            <p className="text-[11px] font-medium text-foreground mb-1.5 block">
              Phone number
            </p>
            <div className="flex items-center border border-border rounded-md bg-background overflow-hidden focus-within:ring-[3px] focus-within:ring-border/50 transition-shadow outline-tg-blue">
              <div className="flex items-center gap-1.5 px-2.5 h-10.5 border-r border-border text-[13px] font-medium bg-muted/20">
                <span className="text-sm">🇮🇹</span>
                +39
                <Icon
                  d={iconsWithPaths.chevDown}
                  size={11}
                  className="text-muted-foreground"
                />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="347 821 4498"
                className="flex-1 px-3 text-sm tabular-nums bg-transparent outline-none w-full border-none focus:ring-0"
              />
            </div>
            <div className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1.5">
              <Icon d={iconsWithPaths.shield} size={11} />
              We never see your messages. Telegram handles the OTP.
            </div>
          </div>

          <TgButton onClick={requestOtp}>Send code on Telegram</TgButton>

          {/* Divider */}
          <div className="flex items-center gap-2.5 my-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground uppercase tracking-[0.06em] font-medium">
              or scan QR
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Small QR inline */}
          <div className="flex items-center gap-3.5 p-3.5 border border-border rounded-lg bg-surface">
            <QR size={84} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold">
                Scan with Telegram
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-normal">
                Open Telegram → Settings → Devices → Link Desktop.
              </div>
              <div
                className={
                  'text-[10px] mt-1.5 font-medium flex items-center gap-1 text-tg-blue'
                }
              >
                <span
                  className="w-1.25 h-1.25 rounded-full animate-pulse"
                  style={{ background: TINTS.green.bd }}
                />
                Waiting · refreshes in 2:48
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
