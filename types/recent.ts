export interface RecentLogsType {
  id: number;
  fileId: number;
  folderId: number | null;
  action: string;
  actionBy: number;
  createdAt: string;
  editorFirstName: string | null;
  editorLastName: string | null;
  fileName: string | null;
  fileSize: number | null;
  folderName: string | null;
}
