import Icon from "./Icon";
import type { BtnVariant, BtnSize } from "@/types/dashboard";
import styles from "@/styles/components/Btn.module.scss";

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: BtnSize;
  icon?: string;
  children?: React.ReactNode;
};

export default function Btn({
  variant = "default",
  size = "md",
  icon,
  children,
  className = "",
  ...rest
}: BtnProps) {
  const iconSize = size === "sm" ? 14 : size === "lg" ? 16 : 15;

  return (
    <button
      data-slot="btn"
      data-variant={variant}
      data-size={size}
      className={`${styles.btn} ${styles[variant]} ${styles[`size-${size}`]} ${className}`}
      {...rest}
    >
      {icon && <Icon d={icon} size={iconSize} />}
      {children}
    </button>
  );
}
