import type { Route } from "next";
import type { ReactNode } from "react";
import type { Tone } from "./dashboard";

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
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
};

export type SidebarItemProps = {
  icon: string;
  label: string;
  count?: number;
  badge?: string;
  url: Route;
};

export type DriveSidebarProps = {
  collapsed?: boolean;
};

export type AlertActionVariant =
  | "default"
  | "destructive"
  | "success"
  | "warning";

export interface AlertModalProps {
  trigger?: ReactNode;
  title: string;
  description?: string;
  confirmText?: string;
  confirmVariant?: AlertActionVariant;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface ColumnDef<T> {
  id: string;
  header: ReactNode | string;
  cell: (row: T, index: number) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string | number;
  classes?: {
    table?: string;
    header?: string;
    row?: string;
    rowLast?: string;
  };
  enableSelection?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (ids: (string | number)[]) => void;
}
