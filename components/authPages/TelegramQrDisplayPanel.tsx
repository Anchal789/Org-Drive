'use client';

import QR from '@/components/ui/TelegramQR';
import Link from 'next/link';

export function TelegramQrDisplayPanel() {
  return (
    <Link
      href={'/qr-login'}
      className="h-full w-full border border-border rounded-lg p-0"
    >
      <div className="flex items-center gap-3.5 p-3.5 border border-border rounded-lg bg-surface cursor-pointer">
        <QR size={84} />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold">Scan with Telegram</div>
          <div className="text-[11px] text-muted-foreground mt-0.5 leading-normal">
            Open Telegram → Settings → Devices → Link Desktop.
          </div>
        </div>
      </div>
    </Link>
  );
}
