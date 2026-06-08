"use client";

import QR from "@/components/ui/TelegramQR";
import Link from "next/link";

export function TelegramQrDisplayPanel() {
  return (
    <Link
      href="/qr-login"
      style={{
        height: "100%",
        width: "100%",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 0,
        textDecoration: "none",
        display: "block",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: 14,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          background: "var(--surface)",
          cursor: "pointer",
        }}
      >
        <QR size={84} />

        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Scan with Telegram
          </div>

          <div
            style={{
              fontSize: 11,
              color: "var(--muted-foreground)",
              marginTop: 2,
              lineHeight: 1.4,
            }}
          >
            Open Telegram → Settings → Devices → Link Desktop.
          </div>
        </div>
      </div>
    </Link>
  );
}
