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

export interface QueuedFile {
  file: File;
  folderName?: string;
  fileCount?: number;
  isFolder: boolean;
  uniqueId: string;
}

export interface UploadStore {
  isWidgetVisible: boolean;
  uploads: Record<string, UploadItem>;
  pendingQueue: QueuedFile[];
  isProcessing: boolean;
  closeWidget: () => void;
  abortUpload: (uniqueId: string) => void;
  startUploads: (
    files: File[],
    folderName?: string,
    fileCount?: number,
  ) => void;
  processQueue: () => Promise<void>;
}
