# Architecture, Feature Details & User Guide

This document is an in-depth reference for Org Drive: a cloud storage platform that uses Telegram's MTProto network as its actual file storage backend, with PostgreSQL used only for lightweight metadata.

---

## 1. Architectural Overview

The application is split across two independent processes plus a database:

- **Frontend + Backend (`org-drive`, Next.js 16 / React 19):** a single Next.js app using the App Router. Server Components and Route Handlers do data fetching, mutations, and streaming; a small set of interactive islands are Client Components (state managed with Zustand). The **React Compiler** is enabled, which auto-memoizes eligible components and values — manual `useMemo`/`useCallback`/`React.memo` are deliberately not sprinkled around because of this.
- **`auth-server` (Node/Express, standalone):** owns the Telegram MTProto connection (via GramJS) used purely for the login handshake — QR-code generation/polling and OTP/2FA verification. It never exposes a raw Telegram session string to the browser; it hands it to the main app only over a private, secret-guarded internal endpoint.
- **PostgreSQL (via Drizzle ORM):** stores only metadata — users, file/folder records, share grants, pending logins, system settings. No file bytes are ever stored in the database.
- **Telegram (via GramJS/MTProto):** the actual file storage layer. Uploaded files are streamed to a bot-owned "storage" chat as Telegram documents; what the database keeps is just the `telegramMessageId`, `documentId`, and `accessHash` needed to fetch them back.

### Data Model (five core tables)

| Table | Purpose |
|---|---|
| `users` | Telegram identity (`telegramId`, encrypted `telegramSessionString`, name, username, phone) |
| `uploaded_files` | File metadata; `folderId` optionally points at a folder |
| `upload_folders` | Folder metadata — **no self-referencing parent column**, which is what makes the one-level hierarchy a schema-level guarantee rather than an app-level convention |
| `shared_items` | A grant of `permission` (`viewer` / `editor`, plus `owner` and `commenter` reserved for future use) from an owner to another user, on either a file or a folder |
| `pending_logins` | Short-lived state for in-progress phone/OTP logins |

### Authentication & Session Model

- **Access token:** JWT, 15-minute expiry, held only in memory (Zustand store, not persisted) — never written to `localStorage`, so it isn't readable by an injected script.
- **Refresh token:** JWT, 7-day expiry, stored in an httpOnly cookie; the client can't read it, only the browser can send it back.
- **`proxy.ts`** (Next.js middleware) is a perimeter check on every `/api/*` request: it independently re-verifies the bearer token before a request even reaches route logic, so a route that forgets its own auth check still fails closed instead of silently allowing access.
- **`requireApiSession()`** is the shared helper every protected route calls directly, giving one consistent, single place that owns "is this request authenticated, and as whom."
- Telegram session strings are encrypted at rest; the app-level JWT secret and encryption secrets fail fast (throw on startup) if missing, rather than silently operating insecurely.
- Login, OTP, and QR-start endpoints are rate-limited (sliding window) to blunt brute-force attempts.

---

## 2. Comprehensive Feature Set

### A. Authentication & Security
- Passwordless login via Telegram: **QR code** (desktop-linking style) or **phone number + OTP** delivered through Telegram itself, not SMS.
- Full **Two-Step Verification (2FA)** support for accounts that have it enabled.
- Session and credential handling designed so the raw Telegram session string never reaches the browser at any point, even during login.
- Rate limiting on auth-sensitive endpoints; fail-fast startup checks on required secrets.

### B. File & Folder Management (CRUD)
- **One-level hierarchy**, enforced at the database schema level: folders hold files, but not other folders.
- **Real-time SSE uploads** with a floating, minimizable progress widget, cancellable via `AbortController`; capped at 50 files / 2GB per file per request.
- Rename (with a 255-character limit on both files and folders), move (validated against a real, owned destination folder), download, and bookmark.

### C. Trash & Permanent Deletion
- **Soft delete:** items are flagged `isDeleted`, not destroyed, and appear in a dedicated Trash view.
- **Restore** or **Delete Permanently** on demand.
- **Automatic sweep:** a cron job permanently deletes trash past its retention window, deleting the Telegram-side copy before committing the database delete (never the reverse), so a Telegram failure can't strand an orphaned pointer.

### D. Sharing & Access Management
- Share individual files or entire folders with other registered users.
- **Role-based access:** Viewer (view/download) or Editor (also rename/move/modify); ownership itself can't be reassigned through sharing.
- **Shared With Me** page for everything others have shared with you.
- **Secure share links** with opaque, server-verified tokens — no raw IDs exposed in the URL.
- Access changes and revocation are scoped to the original owner only.

### E. Tracking & Recent Activity
- **Recent Activity** page: a chronological, grouped timeline (Today / Yesterday / Earlier this week / Older) of the user's own uploads, edits, and shares, with quick-resume actions.

### F. Discovery & Search
- Instant, debounced name search from the top bar.
- Dedicated **Smart Search** page with a natural-language-oriented "Smart" mode alongside standard results.
- **Bookmarks:** star any file/folder; a dedicated page lists them all.

### G. Analytics
- Storage breakdown by file type, upload activity over the last 90 days, top contributors, and per-folder insights — charted on a dedicated Analytics page.

### H. AI Chat (Beta)
- A chat-style interface for asking questions across selected documents. UI-complete today; answers are placeholder/mock pending a real LLM integration.

### I. Settings
- Workspace-level preferences: default drive view (grid/list), organization display name, layout options.

### J. UI / UX
- Full Light/Dark theming.
- Grid and List views, with the List view virtualized for large drives so performance doesn't degrade as file counts grow.
- Responsive layout: desktop tables become mobile-friendly tiles automatically.

---

## 3. How to Drive & Use Org Drive

A practical walkthrough for a new user.

### Signing in
1. Open the app and choose **QR code** or **Phone number** on the login screen.
2. **QR code:** open Telegram on your phone → Settings → Devices → Link Desktop Device → scan the code shown on screen. The page updates automatically once the scan is confirmed.
3. **Phone number:** enter your number, then enter the login code Telegram sends to your Telegram app (check the Telegram app itself, not your SMS inbox).
4. If your account has Two-Step Verification enabled, enter your cloud password when prompted.
5. You'll land on **My Drive** automatically once signed in.

### Uploading and organizing files
1. From **My Drive**, click **New** (or drag files/folders directly onto the page) to upload.
2. Watch progress in the floating widget at the bottom of the screen — you can keep browsing while it uploads, or minimize it.
3. Click **New Folder** to create a folder, then move files into it via each file's `···` menu → **Move**.
4. Remember: a folder can hold files but not another folder — plan your structure as a single flat layer of folders.

### Renaming, moving, downloading, bookmarking
- Open the `···` menu on any file or folder for **Rename**, **Move**, **Download**, and **Bookmark**.
- Bookmarked items collect on the **Bookmark** page in the sidebar for quick access later.

### Sharing with someone else
1. Open a file or folder's `···` menu → **Share**.
2. Search for the person by name or username and select them.
3. Choose their role: **Viewer** (can see/download only) or **Editor** (can also modify).
4. Or click **Copy Link** to get a shareable URL you can send through any other app.
5. The other person will see the item under **Shared With Me** in their own sidebar the next time they sign in.
6. To change someone's role or revoke their access later, reopen the Share dialog — only you, as the owner, can do this.

### Finding things again
- Use the **top search bar** for a quick name-based lookup across your whole drive.
- Use the **Smart Search** page (sidebar) for a dedicated search experience, including a "Smart" natural-language mode.
- Use **Recent** (sidebar) to see a timeline of what you've recently uploaded, edited, or shared, and jump straight back into it.

### Deleting and restoring
1. Select one or more items and choose **Delete** — they move to **Trash**, not gone for good.
2. Open **Trash** (sidebar) to **Restore** something deleted by mistake, or **Delete Permanently** to remove it for good immediately.
3. Anything left in Trash past its retention window is permanently removed automatically — no action needed, but there's no undo once that happens (or once you choose Delete Permanently yourself).

### Checking usage and activity
- Visit **Analytics** (sidebar) for a breakdown of storage by file type, recent upload trends, and folder-level insights.
- Visit **Settings** (sidebar) to adjust your default drive view and workspace display preferences.

### AI Chat
- **Ask AI** (sidebar, marked **Beta**) opens a chat-style assistant for asking questions about your documents. It's a preview of the intended experience — responses are currently placeholders, not real answers, while LLM integration is in progress.
