import { toast } from 'sonner';
import { deleteData, postData } from '@/lib/api-fn';

export const renameItem = async (
  id: number,
  newName: string,
  isFile: boolean,
  shareId?: number,
  pathName?: string,
) => {
  const response = await postData({
    url: `/api/rename/${isFile ? 'file' : 'folder'}`,
    payload: { id, newName, shareId, pathName },
  });
  return response;
};

export const trashFolder = async (
  id: number,
  shareId?: number,
  pathName?: string,
) => {
  const response = await deleteData({
    url: '/api/folder/delete',
    params: {
      id,
      shareId,
      pathName,
    },
  });

  if (response.success) {
    toast.success(response.message);
  } else {
    toast.error(response.message);
  }
  return response;
};
