"use client";

import { CheckboxProps } from "@/types/component-types";
import { FunctionComponent } from "react";

const Checkbox: FunctionComponent<CheckboxProps> = ({
  checked = false,
  indeterminate = false,
  size = 16,
  disabled = false,
  onClick,
  style,
}) => {
  const filled = checked || indeterminate;
  return (
    <span
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      onClick={disabled ? undefined : onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        flexShrink: 0,
        border: `1px solid ${filled ? "var(--primary)" : "var(--border)"}`,
        background: filled ? "var(--primary)" : "var(--background)",
        color: "var(--primary-foreground)",
        borderRadius: "var(--radius-sm)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background .12s, border-color .12s",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {indeterminate ? (
        <svg
          width={size * 0.72}
          height={size * 0.72}
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 8h8"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      ) : checked ? (
        <svg
          width={size * 0.72}
          height={size * 0.72}
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M3 8l3.5 3.5L13 4"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
};

export { Checkbox };
