import type { FileKind } from "./dashboard";

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
  folderId?: number;
  ownerFirstName?: string;
  ownerLastName?: string;
}

export interface UploadedFolder {
  id: number;
  userId: number;
  name: string;
  fileCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  ownerFirstName?: string;
  ownerLastName?: string;
}

export interface UploadFilesResponse {
  telegramMessageId: number;
  documentId: string;
  accessHash: string;
  name: string;
  size: number;
  mimeType: string;
  starred?: boolean;
  folderId?: number;
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
  permission: "viewer" | "editor" | "owner" | "commenter";
  createdAt: Date;
}
