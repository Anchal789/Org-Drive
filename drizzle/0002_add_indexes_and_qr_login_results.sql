-- Custom SQL migration file, put your code below! --

-- Durable handoff cache for completed QR logins (see db/schema.ts for the
-- rationale). Only the terminal "success" result is stored here; the
-- "waiting"/"needs_password" steps still rely on auth-server's in-memory
-- qrStore since they hold a live TelegramClient connection.
CREATE TABLE "qr_login_results" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "qr_login_results_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"login_id" varchar(255) NOT NULL,
	"telegram_id" varchar(255) NOT NULL,
	"telegram_session_string" text NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"username" varchar(255),
	"phone" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qr_login_results_login_id_unique" UNIQUE("login_id")
);
--> statement-breakpoint
CREATE INDEX "idx_qr_login_results_login_id" ON "qr_login_results" USING btree ("login_id");
--> statement-breakpoint
CREATE INDEX "idx_pending_logins_phone" ON "pending_logins" USING btree ("phone");
--> statement-breakpoint
CREATE INDEX "idx_pending_logins_created_at" ON "pending_logins" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "idx_uploaded_files_user_deleted" ON "uploaded_files" USING btree ("user_id","is_deleted");
--> statement-breakpoint
CREATE INDEX "idx_uploaded_files_folder_id" ON "uploaded_files" USING btree ("folder_id");
--> statement-breakpoint
CREATE INDEX "idx_upload_folders_user_deleted" ON "upload_folders" USING btree ("user_id","is_deleted");
--> statement-breakpoint
CREATE INDEX "idx_shared_items_shared_with_user_id" ON "shared_items" USING btree ("shared_with_user_id");
--> statement-breakpoint
CREATE INDEX "idx_shared_items_user_id" ON "shared_items" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "idx_shared_items_file_id" ON "shared_items" USING btree ("file_id");
--> statement-breakpoint
CREATE INDEX "idx_shared_items_folder_id" ON "shared_items" USING btree ("folder_id");
--> statement-breakpoint
CREATE INDEX "idx_trashed_user_id" ON "trashed" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "idx_trashed_created_at" ON "trashed" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "idx_recent_user_id_created_at" ON "recent" USING btree ("user_id","created_at");
