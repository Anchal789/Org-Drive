import { Tone } from "@/types/dashboard";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function encrypt(text: string) {
  return btoa(text);
}

export function decrypt(text: string) {
  return atob(text);
}

export const formatFileDate = (date: string | Date): string => {
  const targetDate = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - targetDate.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const isToday = targetDate.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = targetDate.toDateString() === yesterday.toDateString();

  if (isToday) {
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    if (hours < 6) {
      return `${hours}h ago`;
    }
    return `Today ${targetDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    })}`;
  }
  if (isYesterday) {
    return "Yesterday";
  }
  if (days < 7) {
    return `${days}d ago`;
  }
  if (days < 30) {
    return `${Math.floor(days / 7)}w ago`;
  }
  return targetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const AVATAR_COLORS: Tone[] = [
  "blue",
  "green",
  "amber",
  "red",
  "violet",
  "teal",
  "sky",
  "pink",
  "slate",
];

export const getAvatarColor = (seed: string | number): Tone => {
  const str = String(seed);

  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
