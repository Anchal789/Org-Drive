export type Status = 'loading' | 'waiting' | 'success' | 'expired' | 'error';

export type TelegramUser = {
  telegramId: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
};
