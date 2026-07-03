export interface KnowledgeDocument {
  id: string;
  name: string;
  category: string;
  size: string;
  selected: boolean;
  isSyncing?: boolean;
}

export interface PromptOption {
  id: string;
  title: string;
  description: string;
  icon: any;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  initials?: string;
  content: string;
  citations?: { label: string; file: string; page: string }[];
}
