import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function saveUserFinalSession(
  telegramUserId: number,
  finalSessionString: undefined,
) {
  return await prisma.user.upsert({
    where: { telegramId: telegramUserId.toString() },
    update: { telegramSession: finalSessionString },
    create: {
      telegramId: telegramUserId.toString(),
      telegramSession: finalSessionString,
    },
  });
}

export async function getFromYourDatabase(phoneNumber: string) {
  return await prisma.user.findUnique({
    where: { phone: phoneNumber },
  });
}

export async function saveToYourDatabase(data: {
  phone: string;
  phoneCodeHash: string;
  session: string;
}) {
  return await prisma.user.create({
    data: {
      phone: data.phone,
      phoneCodeHash: data.phoneCodeHash,
      session: data.session,
    },
  });
}
