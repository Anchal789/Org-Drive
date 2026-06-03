import { TelegramClient } from "telegram";

export type QRLoginStatus =
  | "loading"
  | "waiting"
  | "needs_password"
  | "success"
  | "expired"
  | "error";

export type TelegramUser = {
  telegramId: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
};

export type QRLoginEntry = {
  client: TelegramClient;
  createdAt: number;
  status: QRLoginStatus;
  user: any | null;
  error: string | null;
  passwordHint: string | null;
};

export type OTPLoginEntry = {
  client: TelegramClient;
  phoneNumber: string;
  phoneCodeHash: string;
  createdAt: number;
  status: "waiting" | "needs_password" | "success" | "error";
  user: any | null;
  error: string | null;
  passwordHint: string | null;
};
