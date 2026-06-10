import { UploadingProgress } from "./files";

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
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
  uploadedFiles: UploadingProgress;
}
