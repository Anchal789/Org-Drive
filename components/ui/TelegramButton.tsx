"use client";

import { iconsWithPaths } from "@/constants/common-constants";
import Icon from "./Icon";
import { useRouter } from "next/navigation";
import { Route } from "next";

export default function TelegramButton({
  children,
  size = "lg",
  onClick,
  className = "",
  isNavigatingButton = false,
  navigateTo = "/",
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  size?: "sm" | "lg";
  onClick?: () => void;
  className?: string;
  isNavigatingButton?: boolean;
  navigateTo?: Route<string>;
  type?: "submit" | "reset" | "button";
  disabled?: boolean;
}) {
  const hClass = size === "lg" ? "h-[44px]" : "h-[36px]";
  const navigate = useRouter();

  return (
    <button
      type={type || "button"}
      onClick={
        isNavigatingButton ? () => navigate.push(`${navigateTo}`) : onClick
      }
      disabled={disabled}
      // className={`inline-flex items-center justify-center gap-2 w-full text-white border-none rounded-md text-sm font-semibold cursor-pointer shadow-sm hover:opacity-90 transition-opacity bg-tg-blue ${hClass} ${className}`}
      style={{
        color: "var(--text-white)",
        background: "var(--tg-blue)",
        borderColor: "var(--tg-blue)",
        fontSize: "var(--text-sm)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        fontWeight: "var(--font-semibold)",
        cursor: "pointer",
        transition: "opacity 0.2s ease-in-out",
        opacity: "1",
        borderRadius: "var(--radius-md)",
        width: "100%",
        height: size === "lg" ? "44px" : "36px",
      }}
    >
      <Icon
        d={iconsWithPaths.send}
        size={16}
        stroke={2}
        className="rotate-15"
      />
      {children}
    </button>
  );
}
