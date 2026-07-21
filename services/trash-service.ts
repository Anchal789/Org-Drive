import { toast } from 'sonner';
import { deleteData, postData } from '@/lib/api-fn';

export const restoreFile = async (trashId: number) => {
  const response = await postData({
    url: '/api/trash/restore',
    payload: { id: trashId },
  });

  if (response.success) {
    toast.success(response.message);
  } else {
    toast.error(response.message);
  }
  return response;
};

export const permanentDeleteFile = async (trashId: number) => {
  try {
    const response = await deleteData({
      url: `/api/trash/delete-permanently?id=${trashId}`,
    });

    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
    return response;
  } catch {
    toast.error('Something went wrong');
  }
};

export const emptyTrash = async () => {
  try {
    const response = await deleteData({
      url: '/api/trash/delete-all-permanently',
    });

    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
    return response;
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'Something went wrong',
    );
  }
};
