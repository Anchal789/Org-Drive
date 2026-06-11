import { UploadItem } from "./dashboard";

export interface AuthStateStore {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
}

export interface DragDropStore {
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  files: File[];
  setFiles: (files: File[]) => void;
}

export interface UploadStore {
  isWidgetVisible: boolean;
  uploads: Record<string, UploadItem>;
  pendingQueue: File[];
  isProcessing: boolean;
  closeWidget: () => void;
  abortUpload: (fileName: string) => void;
  startUploads: (files: File[]) => void;
  processQueue: () => Promise<void>;
}
