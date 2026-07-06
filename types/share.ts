import type { ShareWithMePerson } from "@/types/share-with-me";
import type { User } from "@/types/auth";

export type SharePermission = "viewer" | "editor" | "owner" | "commenter";

export type InviteUser = User & { permission: SharePermission };

export type ShareState = {
  searchTerm: string;
  parentFolderName: string | null;
  isLoading: boolean;
  usersWithAccess: ShareWithMePerson[];
  usersToInvite: InviteUser[];
};

export type ShareAction =
  | { type: "reset" }
  | { type: "set_search_term"; searchTerm: string }
  | { type: "set_loading"; isLoading: boolean }
  | { type: "set_parent_folder_name"; parentFolderName: string | null }
  | { type: "set_users_with_access"; usersWithAccess: ShareWithMePerson[] }
  | { type: "set_users_to_invite"; usersToInvite: InviteUser[] }
  | {
      type: "update_invite_permission";
      index: number;
      permission: InviteUser["permission"];
    }
  | {
      type: "update_access_permission";
      index: number;
      permission: ShareWithMePerson["permission"];
    };
