import QR from '@/components/ui/TelegramQR';
import { TINTS } from '@/constants/common-constants';
import PhoneLogin from './PhoneLogin';
import { TelegramQrDisplayPanel } from './TelegramQrDisplayPanel';

export default function LoginPage() {
  return (
    <div
      className="min-h-screen w-full flex flex-col lg:flex-row bg-background text-foreground font-sans"
      data-screen-label="00 Login · Split hero"
    >
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-95 flex flex-col gap-4.5">
          {/* Header — static, server-rendered */}
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

          {/* Interactive island — the only client component */}
          <PhoneLogin />

          {/* Divider — static */}
          <div className="flex items-center gap-2.5 my-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground uppercase tracking-[0.06em] font-medium">
              or scan QR
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* QR card — static */}
          <TelegramQrDisplayPanel />
        </div>
      </div>
    </div>
  );
}
