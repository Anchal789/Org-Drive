# [OrgDrive](https://org-drive.vercel.app) — Telegram-Powered Cloud File Storage Platform

> A high-performance, workspace-style file storage platform that utilizes Telegram's cloud infrastructure as a free, permanent storage backend, complete with an optional AI-powered semantic search engine.

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Comprehensive Features](#comprehensive-features)
- [Authentication](#authentication)
- [File System Design](#file-system-design)
- [Upload Lifecycle](#upload-lifecycle)
- [Analytics Engine](#analytics-engine)
- [AI Ingestion (Optional)](#ai-ingestion-optional)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How Storage Works](#how-storage-works)
- [Contributing](#contributing)

---

## Overview

OrgDrive is a highly responsive web workspace that repurposes Telegram's MTProto infrastructure as a scalable file storage backend. It combines a familiar, flat UI file explorer with enterprise-grade features—offering permanent, chunked file storage without the traditional costs associated with cloud providers.

**Core Concept:**

- **Storage:** Files are stored in Telegram channels (providing free, permanent, and unlimited capacity).
- **Metadata:** All folder hierarchies, permissions, and user data are strictly managed within a relational SQL database.
- **Security:** Authentication is handled entirely via Telegram Login, eliminating password vulnerabilities.
- **Intelligence:** An optional AI layer enables semantic, vector-based document search.

---

## System Architecture

OrgDrive operates on a decoupled architecture, separating the web interface, metadata registry, and binary storage layers.

```mermaid
graph TD
    Client[Client Application Interface<br/>UI Canvas & Upload Loop] -->|JSON Web Tokens & Byte Streams| Server[Core Application Server<br/>Auth, Metadata, Telemetry]

    Server -->|Binary Payloads| Proxy[OrgDrive Proxy<br/>MTProto Tunneling & Chunking]
    Server -->|Metadata Sync| DB[(Relational Database<br/>Topologies & Folders)]

    Proxy -->|512KB Packets| Telegram[Telegram API Cloud<br/>Permanent Storage]

    DB -->|Vector Targets| AI[(Optional AI Vector DB<br/>Semantic Context Index)]
```

### Core Infrastructure Units

| Layer              | Component                 | Responsibility                                                                       |
| :----------------- | :------------------------ | :----------------------------------------------------------------------------------- |
| **Web & Server**   | Application Engine        | Frontend UI, JWT authentication, metadata orchestration, and storage routing.        |
| **Storage Bridge** | OrgDrive Middleware Proxy | MTProto tunneling, payload chunking (512KB packets), and Telegram channel transfers. |
| **Data Layer**     | Relational Registry       | Folder maps, file metadata, user profiles, and vector embeddings (optional).         |

---

## Comprehensive Features

OrgDrive is built to function as a complete cloud drive replacement with a rich feature set:

### File & Workspace Management

- **Single-Level Flat Folders:** Enforces a one-level hierarchy (files inside folders, but no nested sub-folders) for maximum database performance and a clean, clutter-free workspace.
- **Full CRUD Operations:** Seamlessly create folders, upload files, rename items, move files between directories, and download content to your local device.
- **Trash & Permanent Delete:** Soft-delete functionality moves items to a dedicated Trash bin. Users can restore items or permanently delete them to wipe metadata from the database.
- **Upload Engine (SSE):** Real-time, byte-level progress tracking across the entire upload lifecycle via Server-Sent Events, complete with background processing and cancellation.

### Discovery & Organization

- **Smart Search:** Instantly find files and folders by name across the entire drive using a debounced, highly responsive search bar.
- **Bookmarks:** Star or bookmark important files and folders. Access them instantly via a dedicated "Bookmarked Items" page.
- **Recent Logs:** A dedicated workflow hub that tracks your recent activity (uploaded, downloaded, shared, or edited files), allowing you to quickly resume tasks.

### Collaboration

- **Share Files & Folders:** Share any item with other registered users on the platform.
- **Access Management (RBAC):** Granular permission controls. Assign users as Viewers, Editors, or Owners.
- **Shared With Me:** A dedicated page where users can browse all files and folders that have been explicitly shared with them.
- **Secure Link Generation:** Generate AES-encrypted, shareable links to instantly share files externally.

### Smart Features & UI

- **AI Chat (Dummy / Placeholder):** An integrated "Ask AI" chat interface designed for semantic search and document summarization (ready for LLM integration).
- **Theming:** Full support for Light and Dark modes.
- **Responsive Design:** Intelligently adapts to desktop, tablet, and mobile displays. Features grid/list view toggles for desktop and optimized touch-friendly tiles for mobile.

---

## Authentication

OrgDrive leverages the **Telegram Login Widget API**, eliminating the need for emails, passwords, or third-party OAuth providers. Users can log in seamlessly using:

1. **QR Code Scan** via the Telegram Mobile App.
2. **Phone Number & OTP** sent securely to their Telegram account.

```mermaid
sequenceDiagram
    participant User
    participant App as OrgDrive Client
    participant Telegram as Telegram Widget
    participant Server as Core Server

    User->>App: Opens login page (Selects QR or OTP)
    App->>Telegram: Renders official Auth interface
    User->>Telegram: Scans QR or enters OTP
    Telegram-->>Server: Redirect payload (id, hash, auth_date)
    Server->>Server: HMAC-SHA256 verification via BOT_TOKEN
    Server-->>App: Returns signed JWT for session
```

---

## File System Design

To eliminate recursive lookup latency, OrgDrive enforces a **Strict Single-Level Folder Architecture**.

**Rules:**

1. Folders cannot contain other folders (no sub-directories).
2. A file's `folder_id` must point directly to a terminal directory.
3. If `folder_id` is `null`, the file resides at the workspace root.

### Database Entity Relationship

```mermaid
erDiagram
    TENANTS ||--o{ FOLDERS : contains
    FOLDERS ||--o{ FILES : holds
    TENANTS {
        uuid id
        string org_name
        string channel_id
    }
    FOLDERS {
        uuid id
        string display_name
        uuid org_id
    }
    FILES {
        uuid id
        uuid folder_id
        string name
        int size_bytes
        string telegram_address
    }
```

> The `telegram_address` field acts as the pointer mapping the database record to the specific chunks residing in the Telegram channel.

---

## Upload Lifecycle

Every file upload passes through a highly observable 4-stage state machine.

| Stage            | Action                                             | Visual UI State                 |
| :--------------- | :------------------------------------------------- | :------------------------------ |
| **1. Pending**   | File dropped, optimistic UI render begins.         | Soft-pulsing placeholder row    |
| **2. Uploading** | Browser streams bytes to server via HTTP POST.     | Live 0–100% byte counter        |
| **3. Indexing**  | Middleware slices file into 512KB MTProto packets. | Infinite marquee badge          |
| **4. Complete**  | Final chunk written; DB record committed.          | Solid green checkmark, unlocked |

---

## Analytics Engine

The built-in analytics workspace tracks organizational activity and infrastructure health.

- **Storage Usage:** Total bytes consumed vs. allocated quotas.
- **File Type Distribution:** Categorical breakdown (Documents, Archives, Images, Media).
- **Bandwidth Graphs:** Time-series analysis of upload and download traffic.
- **Infrastructure Health:** Round-trip latency to Telegram data centers and rate-limit monitoring.

---

## AI Ingestion (Optional)

The AI processing layer is completely decoupled from the critical upload path, ensuring file operations remain instantly responsive.

```mermaid
graph LR
    Upload[Upload Complete] --> DB[File Metadata Committed]
    DB --> Check{AI Status}

    Check -->|Disabled| Skip[Skip Pipeline<br/>File Ready Instantly]

    Check -->|Enabled| Queue[Queue Background Job]
    Queue --> Download[Download File Text]
    Download --> Split[Split into Paragraphs]
    Split --> Embed[Generate Vector Embeddings]
    Embed --> VDB[(Write to Vector DB)]
```

When enabled, users gain access to the **"Ask AI"** feature for semantic, natural-language search across their uploaded files.

---

## Environment Variables

Copy the `.env.example` file to `.env` and populate the required fields.

```env
# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_APP_API_ID=your_telegram_app_id
TELEGRAM_APP_API_HASH=your_telegram_app_api_hash
TELEGRAM_STORAGE_CHANNEL_ID=your_storage_channel_id

# Application
JWT_SECRET=your_jwt_secret_key

# Database
DATABASE_URL=postgresql://user:password@host:5432/orgdrive

NEXT_PUBLIC_PHONE_OBFUSCATION_KEY=your_encryption_decryption_key
NEXT_PRIVATE_CRON_SECRET=your_cron_key
```

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- PostgreSQL database
- Telegram Bot Token (via [@BotFather](https://t.me/BotFather))
- A dedicated Telegram Channel (for file storage)

### Installation

```bash
# 1. Clone the repository
git clone [https://github.com/Anchal789/Org-Drive](https://github.com/Anchal789/Org-Drive)

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Run database migrations
npm run db:migrate

# 5. Start the Orgdrive proxy daemon (in a separate terminal)
./orgdrive-proxy --config config.yaml

# 6. Start the application
npm run dev
```

---

## Project Structure

```text
orgdrive/
├── client/                  # Frontend single-page application
│   ├── components/
│   │   ├── FileExplorer/    # Drive-style file browser
│   │   ├── UploadZone/      # Drag-and-drop with multi-stage progress
│   │   └── Analytics/       # Dashboard & charts
│   └── pages/
│
├── server/                  # Core application server
│   ├── auth/                # Telegram HMAC-SHA256 verification & JWT
│   ├── metadata/            # Folder/file metadata engine
│   ├── telemetry/           # Bandwidth & storage aggregation
│   └── ai/                  # Optional async AI ingestion queue
│
├── proxy/                   # Orgdrive MTProto middleware daemon
│   ├── chunker/             # 512KB packet splitter
│   └── telegram/            # MTProto channel transfer handlers
│
├── database/
│   ├── migrations/          # SQL schema migrations
│   └── schema/              # Tenants, Folders, Files, Vector tables
│
├── .env.example
├── config.yaml              # Orgdrive proxy configuration
└── README.md
```

---

## How Storage Works

```mermaid
graph TD
    File[Your File<br/>Any Size] --> Proxy[OrgDrive Proxy]
    Proxy -->|Splits into 512KB chunks| Telegram[Telegram MTProto Channel]
    Telegram -->|Permanent Free Storage| DB[(PostgreSQL Database)]
    DB -.->|Stores pointer/address<br/>e.g. channel: -1001234, parts: 101, 102| Proxy
```

When a user initiates a download, the database fetches the pointer address, the OrgDrive proxy reassembles the chunks from Telegram, and streams the unified file back to the user.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: implement robust feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request.

---

## License

This project is distributed under the MIT License. See `LICENSE` for more information.

> **Disclaimer:** This project utilizes Telegram's infrastructure for storage. Ensure your usage strictly complies with [Telegram's Terms of Service](https://telegram.org/tos). It is highly recommended to use a dedicated private channel for file storage and to never expose your Bot Token publicly.
