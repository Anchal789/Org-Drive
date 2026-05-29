# TelDrive — Telegram-Powered Cloud File Storage Platform

> A high-performance, workspace-style file storage platform that uses Telegram's cloud infrastructure as a free, permanent storage backend — with optional AI-powered document search.

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
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

TelDrive is an un-nested, highly responsive web workspace that repurposes Telegram's cloud infrastructure as a free, scalable file storage backend. It combines a Google Drive-style UI with Telegram's MTProto protocol to offer permanent, chunked file storage — without any traditional cloud storage costs.

**Core Concept:**

- Files are stored in **Telegram channels** (free, permanent, unlimited)
- All **metadata, folders, and user data** live in a relational SQL database
- Authentication is handled entirely via **Telegram Login** (no passwords)
- An **optional AI layer** enables semantic document search

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATION INTERFACE                    │
│   • Google Drive-Style Flat UI Canvas   • Dynamic Upload Progress Loop │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                       (JSON Web Tokens & Byte Streams)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE APPLICATION SERVER                         │
│   • Telegram Login Validator  • Metadata Engine  • Telemetry Aggregator│
└────────────┬──────────────────────────────────────────────────┬────────┘
             │                                                  │
   (Direct File Chunks)                                 (Metadata Sync)
             ▼                                                  ▼
┌─────────────────────────┐                        ┌─────────────────────────┐
│     TELDRIVE PROXY      │                        │   RELATIONAL DATABASE   │
│ • MTProto Tunneling     │                        │ • Workspace Topologies  │
│ • Channel Part Slicing  │                        │ • Single-Level Folders  │
└────────────┬────────────┘                        │ • Optional AI Queue     │
             │                                     └────────────┬────────────┘
      (Binary Payloads)                                         │
             ▼                                           (Vector Targets)
┌─────────────────────────┐                                     ▼
│   TELEGRAM API CLOUD    │                        ┌─────────────────────────┐
│ • Permanent Storage     │                        │   OPTIONAL AI VECTOR DB │
│ • Free Asset Hosting    │                        │ • Local Text Slices     │
└─────────────────────────┘                        │ • Semantic Context Index│
                                                   └─────────────────────────┘
```

### Three Core Infrastructure Units

| Layer              | Component                 | Responsibility                                                               |
| ------------------ | ------------------------- | ---------------------------------------------------------------------------- |
| **Web & Server**   | Application Engine        | Frontend UI, JWT auth, metadata orchestration, storage routing               |
| **Storage Bridge** | Teldrive Middleware Proxy | MTProto tunneling, file chunking (512KB packets), Telegram channel transfers |
| **Data Layer**     | Relational Registry       | Folder maps, file metadata, user profiles, vector embeddings (optional)      |

---

## Features

- **Telegram-Backed Storage** — Files are chunked and stored permanently in Telegram channels at zero cost
- **Google Drive-Style UI** — Familiar flat file explorer with drag-and-drop support
- **Telegram-Only Auth** — No passwords or OAuth; login via Telegram's cryptographic widget
- **Multi-Stage Upload Telemetry** — Real-time byte-level progress tracking across all upload stages
- **Single-Level Flat Folders** — Fast, recursion-free directory lookups
- **Organization Analytics** — Storage usage, file type distribution, bandwidth graphs, and infrastructure health
- **Optional AI Search** — Asynchronous document parsing and vector-based semantic search (decoupled from upload flow)
- **Multi-Tenant Support** — Each organization maps to its own Telegram channel and bot account

---

## Authentication

TelDrive uses **Telegram Login Widget API** — no email, password, or third-party OAuth required.

### Auth Flow

```
1. User opens login page
       │
       ▼
2. Telegram Login Widget renders (official iframe)
   User enters phone number → confirms in Telegram app
       │
       ▼
3. Telegram sends payload to redirect URI:
   { id, first_name, username, auth_date, hash }
       │
       ▼
4. Server runs HMAC-SHA256 verification
   using TELEGRAM_BOT_TOKEN
       │
       ▼
5. Hash match? → Create/link org workspace profile
                 → Return signed JWT for session
```

> All subsequent API requests are authenticated via the signed **JSON Web Token (JWT)**.

---

## File System Design

TelDrive uses a **Strict Single-Level Folder Architecture** to eliminate recursive lookup lag.

### Rules

- Folders **cannot** contain other folders
- A file's `folder_id` must point to a **terminal directory** (not another folder)
- If `folder_id` is `null`, the file lives at the **workspace root**

### Database Schema

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────────┐
│   Tenants    │       │   Folders    │       │        Files         │
│──────────────│       │──────────────│       │──────────────────────│
│ id           │◄──┐   │ id           │◄──┐   │ id                   │
│ org_name     │   │   │ display_name │   └───│ folder_id (nullable) │
│ channel_id   │   │   │ org_id       │───┘   │ name                 │
│ bot_account  │   └───│ created_at   │       │ size_bytes           │
└──────────────┘       └──────────────┘       │ telegram_address     │
                                              │ created_at           │
                                              └──────────────────────┘
```

> The `telegram_address` field stores the pointer/reference to where the file chunks live inside the Telegram channel.

---

## Upload Lifecycle

Every file upload passes through a **4-stage state machine** with distinct UI states.

```
Stage 1: Local Registration        →  UI: Pulsing placeholder row (Pending)
Stage 2: Client → Server Stream    →  UI: Live % progress counter (Uploading)
Stage 3: Server → Telegram Cloud   →  UI: Infinite marquee "Securing in Cloud Vault..." (Indexing)
Stage 4: Transaction Commit        →  UI: Green checkmark, file becomes interactive (Complete)
```

### Stage Details

| Stage         | Action                                                                    | Visual State                         |
| ------------- | ------------------------------------------------------------------------- | ------------------------------------ |
| **Pending**   | File dropped, optimistic render begins                                    | Soft-pulsing placeholder row         |
| **Uploading** | Browser streams bytes to server via HTTP POST                             | Live 0–100% byte counter             |
| **Indexing**  | Teldrive slices file into 512KB MTProto packets and transfers to Telegram | Infinite marquee badge               |
| **Complete**  | Final chunk written; DB record committed with Telegram address            | Solid green checkmark, file unlocked |

---

## Analytics Engine

The analytics workspace tracks organizational activity and infrastructure health — no monetization components.

| Metric                     | Description                                                          |
| -------------------------- | -------------------------------------------------------------------- |
| **Storage Usage**          | Total bytes consumed vs. quota allocation                            |
| **File Type Distribution** | Pie chart breakdown by category (Documents, Archives, Images, Media) |
| **Bandwidth Graphs**       | Daily and weekly upload/download traffic                             |
| **Infrastructure Health**  | Round-trip latency to Telegram data centers; rate-limit warnings     |

---

## AI Ingestion (Optional)

The AI layer is **completely decoupled** from the upload flow — it never slows down file operations.

```
[Upload Complete] ──► [File Metadata Committed to DB]
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
          AI Status: DISABLED             AI Status: ENABLED
                    │                             │
        ┌───────────┴──────────┐    ┌─────────────┴────────────┐
        │  Skip AI Pipeline    │    │  Queue Background Job     │
        │  Chat UI hidden      │    │  → Download file text     │
        │  File ready instantly│    │  → Split into paragraphs  │
        └──────────────────────┘    │  → Generate vector embeds │
                                    │  → Write to Vector DB     │
                                    └──────────────────────────┘
```

When enabled, users can use **"Chat with Document"** sidebar for semantic search across uploaded files.

---

## Environment Variables

```env
# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHANNEL_ID=your_storage_channel_id

# Application
JWT_SECRET=your_jwt_secret_key
APP_URL=https://your-app-domain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/teldrive

# AI (Optional)
AI_ENABLED=false
VECTOR_DB_URL=your_vector_db_connection_string
```

---

## Getting Started

### Prerequisites

- Node.js (or your chosen backend runtime)
- PostgreSQL database
- A Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- A dedicated Telegram Channel (for file storage)
- Teldrive proxy daemon running on your server

### Setup Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-org/teldrive.git
cd teldrive

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your Telegram bot token, DB URL, etc.

# 4. Run database migrations
npm run db:migrate

# 5. Start the Teldrive proxy daemon
./teldrive-proxy --config config.yaml

# 6. Start the application
npm run dev
```

---

## Project Structure

```
teldrive/
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
├── proxy/                   # Teldrive MTProto middleware daemon
│   ├── chunker/             # 512KB packet splitter
│   └── telegram/            # MTProto channel transfer handlers
│
├── database/
│   ├── migrations/          # SQL schema migrations
│   └── schema/              # Tenants, Folders, Files, Vector tables
│
├── .env.example
├── config.yaml              # Teldrive proxy configuration
└── README.md
```

---

## How Storage Works

```
Your File (any size)
      │
      ▼
Teldrive Proxy
      │  splits into 512KB chunks
      ▼
Telegram MTProto Channel
      │  stores chunks permanently (free)
      ▼
Database stores pointer/address
      │  e.g. { channel: -1001234, parts: [101, 102, 103] }
      ▼
Download: DB fetches address → Teldrive reassembles chunks → streams to user
```

> Telegram provides **free, permanent, unlimited** binary storage. TelDrive simply uses it as an object store — similar to how you'd use S3, but at zero cost.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

> **Note:** This project uses Telegram's infrastructure for storage. Ensure your usage complies with [Telegram's Terms of Service](https://telegram.org/tos). Use a dedicated private channel for file storage and never expose your Bot Token publicly.
