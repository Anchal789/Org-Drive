import type { ShareAction, ShareState } from '@/types/share';

export const initialShareState: ShareState = {
  searchTerm: '',
  parentFolderName: null,
  isLoading: false,
  usersWithAccess: [],
  usersToInvite: [],
};

export function shareReducer(
  state: ShareState,
  action: ShareAction,
): ShareState {
  switch (action.type) {
    case 'reset':
      return initialShareState;
    case 'set_search_term':
      return { ...state, searchTerm: action.searchTerm };
    case 'set_loading':
      return { ...state, isLoading: action.isLoading };
    case 'set_parent_folder_name':
      return { ...state, parentFolderName: action.parentFolderName };
    case 'set_users_with_access':
      return { ...state, usersWithAccess: action.usersWithAccess };
    case 'set_users_to_invite':
      return { ...state, usersToInvite: action.usersToInvite };
    case 'update_invite_permission':
      return {
        ...state,
        usersToInvite: state.usersToInvite.map((user, i) =>
          i === action.index
            ? { ...user, permission: action.permission }
            : user,
        ),
      };
    case 'update_access_permission':
      return {
        ...state,
        usersWithAccess: state.usersWithAccess.map((user, i) =>
          i === action.index
            ? { ...user, permission: action.permission }
            : user,
        ),
      };
    default:
      return state;
  }
}
