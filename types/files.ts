export interface UploadFilesResponse {
  telegramMessageId: string;
  documentId: string;
  accessHash: string;
  name: string;
  size: number;
  mimeType: string;
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
