import { type ClassValue, clsx } from 'clsx';
import CryptoJS from 'crypto-js';
import { twMerge } from 'tailwind-merge';
import type { FileKind, Tone } from '@/types/dashboard';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SECRET_KEY = process.env.NEXT_PUBLIC_PHONE_OBFUSCATION_KEY;

if (!SECRET_KEY) {
  throw new Error(
    'Missing required env var: NEXT_PUBLIC_PHONE_OBFUSCATION_KEY',
  );
}

export function encrypt(text: string) {
  if (!SECRET_KEY) {
    throw new Error(
      'Missing required env var: NEXT_PUBLIC_PHONE_OBFUSCATION_KEY',
    );
  }
  const cipherText = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();

  return cipherText.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decrypt(safeCipherText: string) {
  if (!SECRET_KEY) {
    throw new Error(
      'Missing required env var: NEXT_PUBLIC_PHONE_OBFUSCATION_KEY',
    );
  }
  let cipherText = safeCipherText.replace(/-/g, '+').replace(/_/g, '/');

  while (cipherText.length % 4) {
    cipherText += '=';
  }

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) return null;

    return decryptedText;
  } catch {
    return null;
  }
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
    return `Today ${targetDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    })}`;
  }
  if (isYesterday) {
    return 'Yesterday';
  }
  if (days < 7) {
    return `${days}d ago`;
  }
  if (days < 30) {
    return `${Math.floor(days / 7)}w ago`;
  }
  return targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const AVATAR_COLORS: Tone[] = [
  'blue',
  'green',
  'amber',
  'red',
  'violet',
  'teal',
  'sky',
  'pink',
  'slate',
];

export const getAvatarColor = (seed: string | number): Tone => {
  const str = String(seed);

  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const FOLDER_TONES: Tone[] = [
  'blue',
  'violet',
  'amber',
  'pink',
  'teal',
  'red',
  'green',
  'sky',
];

export function getFolderTone(index: number): Tone {
  return FOLDER_TONES[index % FOLDER_TONES.length];
}

export const getFileExtension = (name: string) =>
  name?.split('.')?.pop() as FileKind;

export const getFileNameWithoutExtension = (name: string) =>
  name?.includes('.') ? name?.substring(0, name.lastIndexOf('.')) : name;
