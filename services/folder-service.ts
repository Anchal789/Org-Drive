import { toast } from 'sonner';
import { deleteData, postData } from '@/lib/api-fn';
import { encrypt } from '@/lib/utils';

export const renameItem = async (
  id: number,
  newName: string,
  isFile: boolean,
  shareId?: number,
) => {
  const response = await postData({
    url: `/api/rename/${isFile ? 'file' : 'folder'}`,
    payload: { id, newName, shareId },
  });
  return response;
};

export const trashFolder = async (id: number, shareId?: number) => {
  const response = await deleteData({
    url: '/api/folder/delete',
    params: {
      id: encrypt(String(id)),
      shareId: encrypt(String(shareId)),
    },
  });

  if (response.success) {
    toast.success(response.message);
  } else {
    toast.error(response.message);
  }
  return response;
};
