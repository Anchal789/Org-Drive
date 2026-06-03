'use client';

import Link from 'next/link';
import TelegramButton from '../ui/TelegramButton';
import { useRouter } from 'next/navigation';

export default function ContinueWithTelegramButton() {
  const navigate = useRouter();
  return (
    <TelegramButton onClick={() => navigate.push('/login')}>
      Continue with Telegram
    </TelegramButton>
  );
}
