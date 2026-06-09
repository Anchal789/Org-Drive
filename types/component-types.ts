import { Tone } from "./dashboard";

export interface InputProps extends React.ComponentProps<"input"> {
  helperText?: string;
  error?: boolean;
}

export type BadgeProps = {
  children: React.ReactNode;
  tone?: Tone;
  outline?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export type SparkProps = {
  data?: number[];
  w?: number;
  h?: number;
  color?: string;
};

export type RingProps = {
  size?: number;
  pct?: number;
  color?: string;
  className?: string;
};

export type UserAvatarProps = {
  initials: string;
  tone?: Tone;
  size?: "sm" | "default" | "lg";
  ring?: boolean;
  className?: string;
};

export type CheckboxProps = {
  checked?: boolean;
  indeterminate?: boolean;
  size?: number;
  disabled?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
};

export type SidebarItemProps = {
  icon: string;
  label: string;
  count?: number;
  badge?: string;
  url?: string;
};

export type DriveSidebarProps = {
  active?: string;
  collapsed?: boolean;
};
