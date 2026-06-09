import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  telegramId: varchar("telegram_id", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  username: varchar("username", { length: 255 }),
  photoUrl: text("photo_url"),
  phone: varchar("phone", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const pendingLoginTable = pgTable("pending_logins", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 255 }).notNull(),
  phoneCodeHash: varchar("phone_code_hash", { length: 255 }).notNull(),
  session: text("session").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
