import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { userTable } from '@/db/schema';

export async function saveUserFinalSession(
  telegramUserId: number,
  finalSessionString: string,
) {
  return await db
    .update(userTable)
    .set({ session: finalSessionString })
    .where(eq(userTable.id, telegramUserId));
}

export async function getFromYourDatabase(phoneNumber: string) {
  return await db
    .select()
    .from(userTable)
    .where(eq(userTable.phone, phoneNumber))
    .orderBy(desc(userTable.id)) // newest first
    .limit(1);
}

export async function saveToYourDatabase(data: {
  phone: string;
  phoneCodeHash: string;
  session: string;
}) {
  await db.delete(userTable).where(eq(userTable.phone, data.phone));
  await db.insert(userTable).values({
    phone: data.phone,
    phoneCodeHash: data.phoneCodeHash,
    session: data.session,
  });
}
