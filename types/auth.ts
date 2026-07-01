import type { TelegramClient } from "telegram";
import type { countryWithPhoneCode } from "@/constants/country-with-phonecode";

export type QRLoginStatus =
  | "loading"
  | "waiting"
  | "needs_password"
  | "success"
  | "expired"
  | "error";

export type TelegramUser = {
  telegramId: string;
  telegramSessionString: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
};

export type QRLoginEntry = {
  client: TelegramClient;
  createdAt: number;
  status: QRLoginStatus;
  user: User | null;
  error: string | null;
  passwordHint: string | null;
};

export type OTPLoginEntry = {
  client: TelegramClient;
  phoneNumber: string;
  phoneCodeHash: string;
  createdAt: number;
  status: "waiting" | "needs_password" | "success" | "error";
  user: User | null;
  error: string | null;
  passwordHint: string | null;
};

export type User = {
  id: number;
  telegramId: string;
  telegramSessionString: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PendingLogin = {
  id: number;
  phone: string;
  phoneCodeHash: string;
  session: string;
  createdAt: Date;
};

export type UpsertUserInput = {
  telegramId: string;
  telegramSessionString: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  phone?: string | null;
};

export type CountryType = (typeof countryWithPhoneCode)[number];

export type SessionUser =
  | (TelegramUser & {
      userId: string;
    })
  | null;

export type Status = "entering_otp" | "needs_password" | "success";

export type VerifyState = {
  status: Status;
  serverError: string | null;
  passwordHint: string | null;
};

export type VerifyAction =
  | { type: "submit_start" }
  | { type: "error"; message: string }
  | { type: "needs_password"; passwordHint: string | null }
  | { type: "success" };
