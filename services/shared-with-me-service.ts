import { toast } from 'sonner';
import { deleteData, postData } from '@/lib/api-fn';
import { encrypt } from '@/lib/utils';

export const trashSharedFile = async (id: number) => {
  const response = await deleteData({
    url: '/api/shared-with-me/delete',
    params: { id: encrypt(String(id)) },
  });

  if (response.success) {
    toast.success(response.message);
  } else {
    toast.error(response.message);
  }
  return response;
};

export const bookmarkSharedItem = async (id: number, bookmark: boolean) => {
  const response = await postData({
    url: '/api/bookmark',
    payload: { id: encrypt(String(id)), bookmark, shared: true },
  });
  if (response.success) {
    toast.success(response.message);
  } else {
    toast.error(response.message);
  }
  return response;
};
