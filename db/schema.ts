import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  phone: varchar("phone", { length: 255 }).notNull(),
  phoneCodeHash: varchar("phoneCodeHash").notNull(),
  session: varchar("session").notNull(),
  firstName: varchar("firstName").notNull(),
  lastName: varchar("lastName").notNull(),
  photoUrl: varchar("photoUrl"),
  telegramId: varchar("telegramId").notNull(),
  username: varchar("username"),
});
