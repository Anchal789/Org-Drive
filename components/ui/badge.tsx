import { TINTS } from "@/constants/common-constants";
import type { BadgeProps } from "@/types/component-types";

const EMPTY_STYLE: React.CSSProperties = {};

export default function Badge({
  children,
  tone,
  outline = false,
  className = "",
  style = EMPTY_STYLE,
  customTone,
}: BadgeProps) {
  const toneKey = tone as keyof typeof TINTS;
  const toneStyles = customTone
    ? {
        ...customTone,
        border: `1px solid ${customTone.border ?? "transparent"}`,
      }
    : tone
      ? {
          background: outline ? "transparent" : TINTS[toneKey]?.bg,
          color: TINTS[toneKey]?.tx,
          border: `1px solid ${outline ? TINTS[toneKey]?.bd : "transparent"}`,
        }
      : {};

  return (
    <span
      data-slot="badge"
      data-tone={tone}
      data-outline={outline}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.125rem 0.5rem",
        borderRadius: "var(--radius-md)",
        fontSize: "12px",
        fontWeight: 500,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        ...toneStyles,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
