"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
  ShieldCheck,
  Table,
  History,
  ChevronLeft,
  Settings2,
  Paperclip,
  SquareTerminal,
  Send,
  X,
  File,
} from "lucide-react";
import styles from "./AiChatsPage.module.scss";
import { KnowledgeDocument, PromptOption, ChatMessage } from "@/types/ai-chat";

const MOCK_DOCS: KnowledgeDocument[] = [
  {
    id: "1",
    name: "Q3_Investor_Update.pdf",
    category: "Finance",
    size: "4.2 MB",
    selected: true,
  },
  {
    id: "2",
    name: "Annual_Compliance.docx",
    category: "Legal",
    size: "812 KB",
    selected: true,
  },
  {
    id: "3",
    name: "Procurement_Forecast.xlsx",
    category: "Ops",
    size: "1.7 MB",
    selected: false,
  },
  {
    id: "4",
    name: "Brand_Guidelines_v4.pdf",
    category: "Brand",
    size: "12.6 MB",
    selected: false,
  },
  {
    id: "5",
    name: "Engineering_Roadmap.md",
    category: "Eng",
    size: "44 KB",
    selected: true,
  },
  {
    id: "6",
    name: "Vendor_Contract_Draft.pdf",
    category: "Legal",
    size: "2.1 MB",
    selected: false,
    isSyncing: true,
  },
  {
    id: "7",
    name: "Sales_Pipeline.csv",
    category: "Sales",
    size: "388 KB",
    selected: false,
  },
  {
    id: "8",
    name: "Board_Deck_Final.pptx",
    category: "Exec",
    size: "28.4 MB",
    selected: true,
  },
  {
    id: "9",
    name: "Customer_Cohort_2025.pdf",
    category: "Growth",
    size: "5.6 MB",
    selected: false,
  },
  {
    id: "10",
    name: "HR_Policy_Handbook.pdf",
    category: "People",
    size: "1.1 MB",
    selected: false,
  },
];

const PROMPT_OPTIONS: PromptOption[] = [
  {
    id: "1",
    title: "Summarize a document",
    description: "Quick TL;DR of any indexed file.",
    icon: <Zap size={15} />,
  },
  {
    id: "2",
    title: "Compare two reports",
    description: "Show diffs between Q2 & Q3 board decks.",
    icon: <Search size={15} />,
  },
  {
    id: "3",
    title: "Compliance check",
    description: "Flag policy violations in vendor contracts.",
    icon: <ShieldCheck size={15} />,
  },
  {
    id: "4",
    title: "Extract a table",
    description: "Pull procurement numbers as CSV.",
    icon: <Table size={15} />,
  },
];

const MOBILE_CHAT_HISTORY: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    initials: "MK",
    content: "Three largest compliance risks this quarter?",
  },
  {
    id: "m2",
    role: "assistant",
    content: "SOC 2 audit drift on access reviews ",
    citations: [
      {
        label: "Compliance.docx · p.8",
        file: "Annual_Compliance.docx",
        page: "8",
      },
      {
        label: "Vendors.pdf · p.2",
        file: "Vendor_Contract_Draft.pdf",
        page: "2",
      },
    ],
  },
];

export default function AiChatPage() {
  const selectedDocs = MOCK_DOCS.filter((d) => d.selected);

  return (
    <div className={styles.layoutWrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarTitleRow}>
            <div>
              <div className={styles.sidebarTitle}>Knowledge sources</div>
              <div className={styles.sidebarSubtitle}>
                <span className={styles.sidebarSubtitleHighlight}>
                  {selectedDocs.length} selected
                </span>{" "}
                · 1,284 chunks indexed
              </div>
            </div>
            <button type="button" className={styles.iconButton}>
              <Plus size={15} />
            </button>
          </div>

          <div className={styles.searchBox}>
            <Search size={13} />
            <span className={styles.searchInputText}>
              Filter by name or tag…
            </span>
          </div>

          <div className={styles.selectAllRow}>
            <label htmlFor="select-all-docs" className={styles.checkboxLabel}>
              <Checkbox id="select-all-docs" checked="indeterminate" />
              <span>Select all</span>
            </label>
            <span className={styles.scopeText}>Scope: Compliance folder</span>
          </div>
        </div>

        <div className={styles.docList}>
          {MOCK_DOCS.map((doc) => (
            <label
              key={doc.id}
              className={`${styles.docItem} ${doc.selected ? styles.docItemActive : ""}`}
            >
              <Checkbox checked={doc.selected} />
              <FileText size={15} className={styles.docIcon} />
              <div className={styles.docInfo}>
                <div className={styles.docName}>{doc.name}</div>
                <div className={styles.docMeta}>
                  <span className={styles.tagBadge}>{doc.category}</span>
                  <span className={styles.docSize}>{doc.size}</span>
                </div>
              </div>
              {doc.isSyncing && (
                <RefreshCw size={12} className={styles.docSyncIcon} />
              )}
            </label>
          ))}
        </div>

        <div className={styles.sidebarFooter}>
          <button type="button" className={styles.actionBtnPrimary}>
            <Plus size={14} /> Save as collection
          </button>
          <button type="button" className={styles.actionBtnGhost}>
            <RefreshCw size={14} /> Sync
          </button>
        </div>
      </aside>

      <div className={styles.mainArea}>
        <div className={styles.desktopHeader}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.headerIcon}>
              <Sparkles size={14} />
            </div>
            <div>
              <div className={styles.headerTitle}>New chat</div>
              <div className={styles.headerSubtitle}>
                4 docs primed · gpt-4o · streams via SSE
              </div>
            </div>
          </div>
          <button type="button" className={styles.actionBtnGhost}>
            <History size={14} /> History
          </button>
        </div>

        <div className={styles.mobileHeader}>
          <ChevronLeft size={20} />
          <div className={styles.mobileHeaderInfo}>
            <div className={styles.mobileHeaderTitle}>Compliance Q3 review</div>
            <div className={styles.mobileHeaderSubtitle}>
              4 docs · 14 messages
            </div>
          </div>
          <Settings2 size={18} />
        </div>

        <div className={styles.chatContentDesktop}>
          <div className={styles.heroIcon}>
            <Sparkles size={26} />
          </div>
          <div className={styles.heroText}>
            <h2 className={styles.heroTitle}>Ask your documents anything.</h2>
            <p className={styles.heroSubtitle}>
              4 documents are loaded into context. Answers will cite the exact
              pages they reference.
            </p>
          </div>
          <div className={styles.promptGrid}>
            {PROMPT_OPTIONS.map((prompt) => (
              <button
                type="button"
                key={prompt.id}
                className={styles.promptCard}
              >
                <div className={styles.promptIcon}>{prompt.icon}</div>
                <div>
                  <div className={styles.promptTitle}>{prompt.title}</div>
                  <div className={styles.promptDesc}>{prompt.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.chatContentMobile}>
          {MOBILE_CHAT_HISTORY.map((msg) => (
            <div key={msg.id} className={styles.chatMessage}>
              {msg.role === "user" ? (
                <div className={styles.chatAvatarUser}>{msg.initials}</div>
              ) : (
                <div className={styles.chatAvatarAssistant}>
                  <Sparkles size={12} />
                </div>
              )}
              <div
                className={
                  msg.role === "user"
                    ? styles.chatBubbleUser
                    : styles.chatBubbleAssistant
                }
              >
                {msg.content}
                {msg.role === "assistant" && (
                  <>
                    <span className={styles.citationBadge}>
                      <File size={9} /> {msg.citations?.[0].label}
                    </span>
                    , missing vendor DPAs{" "}
                    <span className={styles.citationBadge}>
                      <File size={9} /> {msg.citations?.[1].label}
                    </span>
                    , and retention exposure on support transcripts.
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <form className={styles.inputFormDesktop}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputPills}>
              {selectedDocs.map((doc) => (
                <span key={doc.id} className={styles.inputPill}>
                  <span className={styles.pillBadge}>PDF</span>
                  {doc.name}
                  <X size={11} className={styles.pillRemove} />
                </span>
              ))}
            </div>
            <input
              type="text"
              aria-label="Ask a question about the selected documents"
              className={styles.textInput}
              placeholder="Ask anything about the selected documents…"
            />
            <div className={styles.inputActions}>
              <div className={styles.actionGroup}>
                <button type="button" aria-label="Attach file" className={styles.iconButton}>
                  <Paperclip size={15} />
                </button>
                <button type="button" aria-label="Open command palette" className={styles.iconButton}>
                  <SquareTerminal size={15} />
                </button>
              </div>
              <button type="button" className={styles.sendBtn}>
                <Send size={14} /> Send
              </button>
            </div>
          </div>
        </form>

        <div className={styles.inputFormMobile}>
          <div className={styles.mobilePillsScroll}>
            {selectedDocs.map((doc) => (
              <span key={doc.id} className={styles.mobilePill}>
                <span className={styles.pillBadge}>PDF</span>
                {doc.name.substring(0, 14)}…
              </span>
            ))}
          </div>
          <div className={styles.mobileInputWrapper}>
            <input
              type="text"
              aria-label="Ask a question about the selected documents"
              className={styles.mobileTextInput}
              placeholder="Ask the docs…"
            />
            <button type="button" aria-label="Send message" className={styles.mobileSendBtn}>
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
