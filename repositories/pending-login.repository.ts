import { desc, eq, lt } from 'drizzle-orm';
import { db } from '@/db';
import { pendingLoginTable } from '@/db/schema';
import type { PendingLogin } from '@/types/auth';

const TTL_MS = 5 * 60 * 1000; // 5 minutes

export const pendingLoginRepository = {
  async cleanupExpired(): Promise<void> {
    const cutoff = new Date(Date.now() - TTL_MS);
    await db
      .delete(pendingLoginTable)
      .where(lt(pendingLoginTable.createdAt, cutoff));
  },

  async findByPhone(phoneNumber: string): Promise<PendingLogin | null> {
    await this.cleanupExpired();
    const rows = await db
      .select()
      .from(pendingLoginTable)
      .where(eq(pendingLoginTable.phone, phoneNumber))
      .orderBy(desc(pendingLoginTable.createdAt))
      .limit(1);
    return rows[0] ?? null;
  },

  async create(data: {
    phone: string;
    phoneCodeHash: string;
    session: string;
  }): Promise<PendingLogin> {
    await db
      .delete(pendingLoginTable)
      .where(eq(pendingLoginTable.phone, data.phone));

    const [created] = await db
      .insert(pendingLoginTable)
      .values({
        phone: data.phone,
        phoneCodeHash: data.phoneCodeHash,
        session: data.session,
      })
      .returning();
    return created;
  },

  async updateSession(id: number, session: string): Promise<void> {
    await db
      .update(pendingLoginTable)
      .set({ session })
      .where(eq(pendingLoginTable.id, id));
  },

  async delete(id: number): Promise<void> {
    await db.delete(pendingLoginTable).where(eq(pendingLoginTable.id, id));
  },
};
