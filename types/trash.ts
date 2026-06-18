export interface TrashInterface {
  id: number;
  userId: number;
  fileId: number;
  fileName: string;
  folderId: number;
  folderName: string;
  size: number;
  isDeleted: boolean;
  createdAt: Date;
}
