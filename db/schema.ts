import {
  boolean,
  index,
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

export const pendingLoginTable = pgTable(
  'pending_logins',
  {
    id: serial('id').primaryKey(),
    phone: varchar('phone', { length: 255 }).notNull(),
    phoneCodeHash: varchar('phone_code_hash', { length: 255 }).notNull(),
    session: text('session').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_pending_logins_phone').on(table.phone),
    index('idx_pending_logins_created_at').on(table.createdAt),
  ],
);

export const uploadedFilesTable = pgTable(
  'uploaded_files',
  {
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
  },
  (table) => [
    index('idx_uploaded_files_user_deleted').on(table.userId, table.isDeleted),
    index('idx_uploaded_files_folder_id').on(table.folderId),
  ],
);

export const uploadFoldersTable = pgTable(
  'upload_folders',
  {
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
  },
  (table) => [
    index('idx_upload_folders_user_deleted').on(table.userId, table.isDeleted),
  ],
);

export const permissionEnum = pgEnum('permission', [
  'viewer',
  'owner',
  'editor',
  'commenter',
]);

export const sharedItemsTable = pgTable(
  'shared_items',
  {
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
  },
  (table) => [
    index('idx_shared_items_shared_with_user_id').on(table.sharedWithUserId),
    index('idx_shared_items_user_id').on(table.userId),
    index('idx_shared_items_file_id').on(table.fileId),
    index('idx_shared_items_folder_id').on(table.folderId),
  ],
);

export const trashedTable = pgTable(
  'trashed',
  {
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
  },
  (table) => [
    index('idx_trashed_user_id').on(table.userId),
    index('idx_trashed_created_at').on(table.createdAt),
  ],
);

// Durable handoff cache for completed QR logins, replacing the terminal
// "success" entry of auth-server's in-memory qrStore Map. The 'waiting'
// and 'needs_password' steps still require the live TelegramClient socket
// held in that Map — those steps stay process-local (or need session
// affinity across auth-server replicas) regardless of this table, since a
// TelegramClient connection cannot be persisted to a row.
export const qrLoginResultsTable = pgTable(
  'qr_login_results',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    loginId: varchar('login_id', { length: 255 }).notNull().unique(),
    telegramId: varchar('telegram_id', { length: 255 }).notNull(),
    telegramSessionString: text('telegram_session_string').notNull(),
    firstName: varchar('first_name', { length: 255 }),
    lastName: varchar('last_name', { length: 255 }),
    username: varchar('username', { length: 255 }),
    phone: varchar('phone', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('idx_qr_login_results_login_id').on(table.loginId)],
);

export const recentTable = pgTable(
  'recent',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id').notNull(),
    fileId: integer('file_id').notNull(),
    folderId: integer('folder_id'),
    action: varchar({ length: 255 }).notNull(),
    actionBy: integer('edit_by').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_recent_user_id_created_at').on(table.userId, table.createdAt),
  ],
);
