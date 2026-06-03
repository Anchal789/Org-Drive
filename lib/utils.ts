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
