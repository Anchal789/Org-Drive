import { Tone } from "./dashboard";

export interface ShareWithMePerson {
  name: string;
  initials: string;
  tone: Tone;
  role: "owner" | "editor" | "viewer" | "commenter";
  email: string;
  me?: boolean;
}

export interface SharedWithMeItemsType {
  id: number;
  userId: number;
  fileId: number;
  fileName: string;
  folderId: number;
  folderName: string;
  sharedWithUserId: number;
  permission: "viewer" | "editor" | "owner" | "commenter";
  createdAt: Date;
  ownerFirstName?: string;
  ownerLastName?: string;
  sharedDate: Date;
}
