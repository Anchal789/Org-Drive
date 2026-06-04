import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userTable } from "@/db/schema";
import type { UpsertUserInput, User } from "@/types/auth";

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
          firstName: data.firstName,
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
};
