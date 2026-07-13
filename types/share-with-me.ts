export interface ShareWithMePerson {
  id: number;
  firstName: string;
  lastName: string;
  permission: 'owner' | 'editor' | 'viewer' | 'commenter';
  username: string;
  shareId: number;
  photoUrl?: string;
}

export interface SharedWithMeItemsType {
  id: number;
  userId: number;
  fileId: number;
  fileName: string;
  folderId: number;
  folderName: string;
  bookmark: boolean;
  sharedWithUserId: number;
  permission: 'viewer' | 'editor' | 'owner' | 'commenter';
  createdAt: Date;
  ownerFirstName?: string;
  ownerLastName?: string;
  sharedDate: Date;
}
