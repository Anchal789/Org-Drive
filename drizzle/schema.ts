import { pgTable, serial, varchar, text, timestamp, unique, integer, foreignKey, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const pendingLogins = pgTable("pending_logins", {
	id: serial().primaryKey().notNull(),
	phone: varchar({ length: 255 }).notNull(),
	phoneCodeHash: varchar("phone_code_hash", { length: 255 }).notNull(),
	session: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	telegramId: varchar("telegram_id", { length: 255 }).notNull(),
	telegramSessionString: text("telegram_session_string").notNull(),
	firstName: varchar("first_name", { length: 255 }),
	lastName: varchar("last_name", { length: 255 }),
	username: varchar({ length: 255 }),
	photoUrl: text("photo_url"),
	phone: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_telegram_id_unique").on(table.telegramId),
]);

export const uploadedFiles = pgTable("uploaded_files", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "uploaded_files_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: integer("user_id").notNull(),
	telegramMessageId: integer("telegram_message_id").notNull(),
	documentId: varchar("document_id", { length: 255 }).notNull(),
	accessHash: varchar("access_hash", { length: 255 }).notNull(),
	name: varchar().notNull(),
	size: integer().notNull(),
	mimeType: varchar("mime_type", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	starred: boolean().default(false).notNull(),
	folderId: integer("folder_id"),
}, (table) => [
	foreignKey({
			columns: [table.folderId],
			foreignColumns: [uploadFolders.id],
			name: "uploaded_files_folder_id_upload_folders_id_fk"
		}),
]);

export const uploadFolders = pgTable("upload_folders", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "upload_folders_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: integer("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	fileCount: integer("file_count").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
});

export const trashed = pgTable("trashed", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "trashed_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: integer("user_id").notNull(),
	fileId: integer("file_id"),
	folderId: integer("folder_id"),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	fileName: varchar("file_name", { length: 255 }),
	folderName: varchar("folder_name", { length: 255 }),
	size: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.fileId],
			foreignColumns: [uploadedFiles.id],
			name: "trashed_file_id_uploaded_files_id_fk"
		}),
	foreignKey({
			columns: [table.folderId],
			foreignColumns: [uploadFolders.id],
			name: "trashed_folder_id_upload_folders_id_fk"
		}),
]);
