import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const userTable = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }),
  phone: varchar('phone', { length: 255 }).notNull(),
  phoneCodeHash: varchar('phoneCodeHash').notNull(),
  session: varchar('session').notNull(),
});
