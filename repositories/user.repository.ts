import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { userTable } from '@/db/schema';
import type { PublicUser, UpsertUserInput, User } from '@/types/auth';

/** Strips session/credential fields before a user record ever reaches a client response. */
export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    photoUrl: user.photoUrl,
  };
}

export const userRepository = {
  async findByTelegramId(telegramId: string): Promise<User | null> {
    const rows = await db
      .select()
      .from(userTable)
      .where(eq(userTable.telegramId, telegramId))
      .limit(1);
    return rows[0] ?? null;
  },

  async findById(id: number): Promise<User | null> {
    const rows = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async upsert(data: UpsertUserInput): Promise<User> {
    const existing = await this.findByTelegramId(data.telegramId);

    if (existing) {
      const [updated] = await db
        .update(userTable)
        .set({
          telegramId: data.telegramId,
          firstName: data.firstName,
          telegramSessionString: data.telegramSessionString,
          lastName: data.lastName,
          username: data.username,
          photoUrl: data.photoUrl,
          phone: data.phone ?? existing.phone,
          updatedAt: new Date(),
        })
        .where(eq(userTable.telegramId, data.telegramId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(userTable)
      .values({
        telegramId: data.telegramId,
        telegramSessionString: data.telegramSessionString,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        photoUrl: data.photoUrl,
        phone: data.phone ?? null,
      })
      .returning();
    return created;
  },

  async delete(id: number): Promise<void> {
    await db.delete(userTable).where(eq(userTable.id, id));
  },
  /** Public directory listing — never select telegramSessionString/telegramId/phone, these are private credentials. */
  async getUsers(limit = 500): Promise<PublicUser[]> {
    return await db
      .select({
        id: userTable.id,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
        username: userTable.username,
        photoUrl: userTable.photoUrl,
      })
      .from(userTable)
      .limit(limit);
  },
  async getUserFirstName(id: number): Promise<string | null> {
    const user = await db
      .select({ firstName: userTable.firstName })
      .from(userTable)
      .where(eq(userTable.id, id))
      .limit(1);

    return user[0]?.firstName ?? null;
  },
};
