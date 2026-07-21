import { type NextRequest, NextResponse } from 'next/server';
import { sendError } from '@/lib/api-response';
import { createSession } from '@/lib/session';
import { userRepository } from '@/repositories/user.repository';

export async function GET(request: NextRequest) {
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.ENABLE_DEV_LOGIN !== 'true'
  ) {
    return sendError('Not found', 404);
  }
  const targetUserId = 30;
  const user = await userRepository.findById(targetUserId);

  if (!user) {
    return sendError('Hardcoded user not found in DB', 404);
  }

  await createSession({
    userId: String(user.id),
    telegramId: String(user.telegramId),
    telegramSessionString: user.telegramSessionString,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    photoUrl: user.photoUrl,
  });

  return NextResponse.redirect(new URL('/my-drive', request.url));
}
