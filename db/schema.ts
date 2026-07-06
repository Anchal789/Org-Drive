import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const systemSettingsTable = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  botSessionString: text('bot_session_string').notNull(),
});

export const userTable = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  telegramId: varchar('telegram_id', { length: 255 }).notNull().unique(),
  telegramSessionString: text('telegram_session_string').notNull(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  username: varchar('username', { length: 255 }),
  photoUrl: text('photo_url'),
  phone: varchar('phone', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const pendingLoginTable = pgTable('pending_logins', {
  id: serial('id').primaryKey(),
  phone: varchar('phone', { length: 255 }).notNull(),
  phoneCodeHash: varchar('phone_code_hash', { length: 255 }).notNull(),
  session: text('session').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const uploadedFilesTable = pgTable('uploaded_files', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull(),
  telegramMessageId: integer('telegram_message_id').notNull(),
  documentId: varchar('document_id', { length: 255 }).notNull(),
  accessHash: varchar('access_hash', { length: 255 }).notNull(),
  name: varchar('name').notNull(),
  size: integer('size').notNull(),
  mimeType: varchar('mime_type', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  bookmark: boolean('bookmark').default(false).notNull(),
  folderId: integer('folder_id').references(() => uploadFoldersTable.id),
});

export const uploadFoldersTable = pgTable('upload_folders', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  fileCount: integer('file_count').notNull().default(0),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  bookmark: boolean('bookmark').default(false).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

const permissionEnum = pgEnum('permission', [
  'viewer',
  'owner',
  'editor',
  'commenter',
]);

export const sharedItemsTable = pgTable('shared_items', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  fileId: integer('file_id').references(() => uploadedFilesTable.id),
  userId: integer('user_id').notNull(),
  folderId: integer('folder_id').references(() => uploadFoldersTable.id),
  sharedWithUserId: integer('shared_with_user_id').notNull(),
  permission: permissionEnum('permission').notNull().default('viewer'),
  bookmark: boolean('bookmark').default(false).notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export const trashedTable = pgTable('trashed', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull(),
  fileId: integer('file_id').references(() => uploadedFilesTable.id),
  fileName: varchar('file_name', { length: 255 }),
  folderId: integer('folder_id').references(() => uploadFoldersTable.id),
  folderName: varchar('folder_name', { length: 255 }),
  size: integer('size').notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const recentTable = pgTable('recent', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull(),
  fileId: integer('file_id').notNull(),
  folderId: integer('folder_id'),
  action: varchar({ length: 255 }).notNull(),
  actionBy: integer('edit_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});
