import type { User } from '@/types/auth';
import type { ShareWithMePerson } from '@/types/share-with-me';

export type SharePermission = 'viewer' | 'editor' | 'owner' | 'commenter';

export type InviteUser = User & { permission: SharePermission };

export type ShareApiItemRef = {
  id?: number;
  fileId?: number;
  folderId?: number | null;
  userId?: number;
};

export type ShareInvitePayload = InviteUser & { userId?: number };

export type ShareApiRequestBody = {
  usersToInvite: ShareInvitePayload[];
  usersWithAccess: ShareWithMePerson[];
  file?: ShareApiItemRef | null;
  folder?: ShareApiItemRef | null;
  files?: ShareApiItemRef[];
};

export type ShareState = {
  searchTerm: string;
  parentFolderName: string | null;
  isLoading: boolean;
  usersWithAccess: ShareWithMePerson[];
  usersToInvite: InviteUser[];
};

export type ShareAction =
  | { type: 'reset' }
  | { type: 'set_search_term'; searchTerm: string }
  | { type: 'set_loading'; isLoading: boolean }
  | { type: 'set_parent_folder_name'; parentFolderName: string | null }
  | { type: 'set_users_with_access'; usersWithAccess: ShareWithMePerson[] }
  | { type: 'set_users_to_invite'; usersToInvite: InviteUser[] }
  | {
      type: 'update_invite_permission';
      index: number;
      permission: InviteUser['permission'];
    }
  | {
      type: 'update_access_permission';
      index: number;
      permission: ShareWithMePerson['permission'];
    };
