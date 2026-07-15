# Architecture & Feature Details

This document provides an in-depth overview of the architecture and comprehensive feature set of the Cloud Storage Platform backed by the Telegram MTProto network.

## 1. Architectural Overview

The application is built on a highly optimized 3-tier architecture:

- **Frontend (Client):** Built with Next.js (React 19), Tailwind CSS, shadcn/ui, and Zustand for global state management. It features a fully responsive design, ensuring seamless usage across desktop, tablet, and mobile devices.
- **Backend (Middleware):** Next.js Server Components and Server Actions handle API requests, streaming, and database mutations securely.
- **Database & Storage:** PostgreSQL (via Drizzle ORM) is used purely for lightweight metadata (names, IDs, aliases, permissions). The actual binary file data is streamed directly to Telegram's MTProto servers (via GramJS), providing limitless cloud storage.

## 2. Comprehensive Feature Set

### A. Authentication & Security

- **Telegram Login (Passwordless):** Users log in using their Telegram accounts. The platform supports dynamic QR Code scanning or Phone Number/OTP verification.
- **2FA Support:** Fully supports Telegram accounts with Two-Factor Authentication enabled.
- **Secure Session Management:** Telegram session strings are AES-encrypted before being stored in the database. JWTs are used for stateless client-side route protection.

### B. File & Folder Management (CRUD)

- **One-Level Hierarchy:** To maintain a clean and structured workspace, the application enforces a one-level folder hierarchy. Top-level folders can contain files, but nested folders (folders inside folders) are intentionally restricted.
- **Upload (Real-Time SSE):** Files are uploaded via Server-Sent Events (SSE). A floating widget tracks real-time progress, groups files by folder, and allows background processing and upload cancellation (via `AbortController`).
- **File Operations:** Standard CRUD operations are fully supported. Users can rename files/folders, download files, and move files into specific folders.

### C. Trash & Permanent Deletion

- **Soft Delete (Trash):** Deleted items are moved to a dedicated "Trash" view (`isDeleted` flag in the database), preventing accidental data loss.
- **Permanent Delete:** Users can permanently destroy files from the Trash, which cleans up the database records.

### D. Sharing & Access Management

- **Share Files & Folders:** Users can share individual files or entire folders with other registered users on the platform.
- **Role-Based Access Control (RBAC):** Granular access management allows assigning roles such as `Viewer`, `Editor`, or `Owner`.
- **Shared With Me Page:** A dedicated view for users to see all files and folders shared with them by others.
- **Secure Links:** Users can generate and copy secure, encrypted links to share items directly.

### E. Tracking & Recent Logs

- **Audit Trail:** The system tracks user interactions (Uploads, Edits, Shares, and Downloads).
- **Recent Activity Page:** A timeline view showing recently touched files, acting as a workflow hub to quickly resume tasks without navigating the entire drive.

### F. Discovery & Smart Features

- **Smart Search:** A powerful search bar allows users to instantly find files and folders by name across their drive.
- **AI Chat (Dummy):** An integrated AI chat interface ("Ask AI" feature) designed to assist users with summarizing documents or finding information (currently in a dummy/placeholder state for future LLM integration).
- **Bookmarks:** Users can "Star" or bookmark important files and folders.
- **Bookmarked Items Page:** A separate, dedicated tab to quickly access all bookmarked/starred items.

### G. UI / UX Enhancements

- **Theming:** Full support for Light and Dark modes.
- **Responsiveness:** The layout adapts intelligently to mobile screens (using `DataTable` or mobile-friendly file tiles) and desktop screens (using grid/list toggle views).

<br>
<br>

# ==========================================

# FILE 2: application-flow.md

# ==========================================

# Application Flow & Diagrams

This document visualizes the core mechanics and data flows of the Cloud Storage Platform using Mermaid diagrams.

## 1. High-Level System Architecture

```mermaid
graph TD
    Client[Client UI / Browser] <-->|React Server Actions & SSE| NextJS[Next.js Server / Middleware]
    NextJS <-->|Drizzle ORM| DB[(PostgreSQL Database)]
    NextJS <-->|GramJS SDK / MTProto| Telegram[Telegram Cloud Storage]

    subgraph Frontend
        Client
    end

    subgraph Core Backend
        NextJS
        DB
    end

    subgraph Cloud Storage
        Telegram
    end
```

## 2. Authentication Flow (QR Code & OTP)

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Next.js Frontend
    participant API as Next.js Auth API
    participant Telegram as Telegram Network
    participant DB as Postgres DB

    User->>UI: Selects QR Code or OTP Login
    UI->>API: Request Login Session
    API->>Telegram: Initialize GramJS Auth Connection
    Telegram-->>API: Return QR Token / OTP Hash
    API-->>UI: Display QR Code / OTP Input
    User->>Telegram: Scans QR / Enters OTP

    loop Polling (Every 2s)
        UI->>API: Check Auth Status
        API->>Telegram: Verify Session
    end

    Telegram-->>API: Auth Success (User Profile)
    API->>DB: Upsert User & Encrypt Session String
    API->>API: Generate JWT
    API-->>UI: Return Success & JWT
    UI->>UI: Redirect to /my-drive
```

## 3. Real-Time Upload Engine (SSE Pipeline)

```mermaid
sequenceDiagram
    autonumber
    participant Store as Zustand (Upload Store)
    participant API as Upload Route (/api/upload)
    participant Telegram as Telegram MTProto
    participant DB as Postgres DB

    Store->>API: POST FormData (File Chunk) + AbortSignal
    activate API
    API->>Telegram: Stream byte chunks

    loop Streaming Data
        Telegram-->>API: Progress (Bytes written)
        API-->>Store: SSE Emit: { type: "progress", pct: 45 }
        Store->>Store: Update UI Progress Bar
    end

    Telegram-->>API: Upload Complete (document_id)
    API->>DB: Insert File Metadata
    DB-->>API: Confirm DB Save
    API-->>Store: SSE Emit: { type: "complete" }
    deactivate API
```

## 4. Dashboard Data Retrieval & Pagination

```mermaid
graph TD
    A[User visits /my-drive or triggers Infinite Scroll] --> B[Trigger 'fetchMoreData' Server Action]
    B --> C[Execute Single Optimized SQL Query]

    subgraph Database Query Logic
        C --> D[SELECT File Metadata FROM uploaded_files]
        D --> E[LEFT JOIN shared_items ON file_id = id]
        E --> F{WHERE is_deleted = false AND...}
        F -->|Condition 1| G[Owned by User AND folder_id IS NULL]
        F -->|Condition 2| H[OR Shared with User]
        G --> I[Apply LIMIT 30 & OFFSET N]
        H --> I
    end

    I --> J[Return 30 Combined Files & Folders]
    J --> K[Append to React Local State]
```
