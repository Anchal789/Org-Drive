import { toast } from 'sonner';
import { deleteData } from '@/lib/api-fn';
import { isTelegramSessionValid } from '@/lib/session';
import { encrypt } from '@/lib/utils';

export const downloadFile = async (fileId: number) => {
  const telegramSession = await isTelegramSessionValid();

  if (!telegramSession.valid) {
    toast.error(telegramSession.message);
    return;
  }

  window.location.href = `/api/file/download/file?fileId=${fileId}`;
};

export const downloadAllFolderFiles = async (
  folderId: string,
  folderName: string,
) => {
  const telegramSession = await isTelegramSessionValid();

  if (!telegramSession.valid) {
    toast.error(telegramSession.message);
    return;
  }

  window.location.href = `/api/file/download/folder-files?folderId=${folderId}&folderName=${folderName}`;
};

export const trashFile = async (fileId: number) => {
  const telegramSession = await isTelegramSessionValid();

  if (!telegramSession.valid) {
    toast.error(telegramSession.message);
    return;
  }

  const response = await deleteData({
    url: '/api/file/delete-file',
    params: { fileId: encrypt(String(fileId)) },
  });

  if (response.success) {
    toast.success(response.message);
  } else {
    toast.error(response.message);
  }
  return response;
};
