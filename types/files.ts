import { FileKind } from "./dashboard";

export interface UploadedFile {
  id: number;
  userId: number;
  telegramMessageId: number;
  documentId: string;
  accessHash: string;
  name: string;
  size: number;
  mimeType: FileKind;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  starred: boolean;
}

export interface UploadedFolder {
  id: number;
  userId: number;
  name: string;
  fileCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadFilesResponse {
  telegramMessageId: number;
  documentId: string;
  accessHash: string;
  name: string;
  size: number;
  mimeType: string;
  starred?: boolean;
}

export interface UploadingProgress {
  totalFiles: number;
  uploadedFiles: number;
  failedFiles: number;
  files: UploadFileProgress[];
}

export interface UploadFileProgress {
  name: string;
  size: number;
  status: string;
  progress: number;
  error?: string;
}

export interface ShareFileType {
  id: number;
  fileId: number;
  sharedWithUserId: number;
  permission: "viewer" | "editor";
  createdAt: Date;
}
