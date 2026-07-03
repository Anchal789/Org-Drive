import type { UploadItem } from "./dashboard";
import { UploadedFile, UploadedFolder } from "./files";

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

export interface FileLayoutStore {
  fileLayout: "list" | "grid";
  setFileLayout: (layout: "list" | "grid") => void;
}

export interface SortByStore {
  sortBy: "name" | "modified" | "size" | "type";
  setSortBy: (sortBy: "name" | "modified" | "size" | "type") => void;
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

export interface ShareWithMeDialogStore {
  open: boolean;
  setOpen: (open: boolean) => void;
  file: (UploadedFile & { fileName?: string; shareId?: number }) | null;
  folder: (UploadedFolder & { folderName?: string }) | null;
  files: Array<UploadedFile & { fileName?: string; shareId?: number }>;
  setFiles: (files: UploadedFile[]) => void;
  setFile: (file: UploadedFile) => void;
  setFolder: (folder: UploadedFolder) => void;
  onSuccess?: () => void;
  onCancel?: () => void;
}
