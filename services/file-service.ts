import { toast } from 'sonner';
import { checkTelegramSessionValidAction } from '@/actions/session-actions';
import { deleteData, postData } from '@/lib/api-fn';
import type { UploadedFile } from '@/types/files';

const triggerHiddenDownload = async (
  url: string,
  filename?: string,
  toastId?: string | number,
) => {
  const id = toastId ?? toast.loading('Preparing download...');

  try {
    const response = await fetch(url, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Download failed.');
    }

    const blob = await response.blob();

    const downloadUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = downloadUrl;

    if (filename) {
      a.download = filename;
    }

    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(downloadUrl);

    toast.success('Download started.', { id });
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Download failed.', {
      id,
    });
  }
};

export const downloadFile = async (fileId: number) => {
  const telegramSession = await checkTelegramSessionValidAction();

  if (!telegramSession.valid) {
    toast.error(telegramSession.message);
    return;
  }

  const url = `/api/file/download/file?fileId=${fileId}`;

  triggerHiddenDownload(url);
};

export const downloadAllFolderFiles = async (
  folderId: number,
  folderName: string,
) => {
  const telegramSession = await checkTelegramSessionValidAction();

  if (!telegramSession.valid) {
    toast.error(telegramSession.message);
    return;
  }

  const url = `/api/file/download/folder-files?folderId=${folderId}&folderName=${encodeURIComponent(folderName)}`;

  triggerHiddenDownload(url, `${folderName}.zip`);
};

export const trashFile = async (
  fileId: number,
  shareId?: number,
  pathName?: string,
) => {
  const response = await deleteData({
    url: '/api/file/delete-file',
    params: {
      fileId,
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

export const bookmarkItem = async (
  id: number,
  isFile: boolean,
  bookmark: boolean,
  pathName?: string,
) => {
  const response = await postData({
    url: '/api/bookmark',
    payload: {
      id,
      isFile,
      bookmark,
      shared: false,
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

export const moveFile = async (
  filesId: number[],
  folderId: string,
  pathName?: string,
) => {
  const response = await postData({
    url: '/api/move-file',
    payload: { filesId, folderId: Number(folderId), pathName },
  });

  if (response.success) {
    toast.success(response.message);
  } else {
    toast.error(response.message);
  }
  return response;
};

export const bookmarkMultiple = async (
  items: { id: number; isFile: boolean; shared: boolean }[],
  bookmarkState: boolean,
  pathName?: string,
) => {
  const response = await postData({
    url: '/api/bookmark/all',
    payload: { items, bookmarkState, pathName },
  });

  if (response.success) {
    toast.success(response.message);
  } else {
    toast.error(response.message);
  }
  return response;
};

export const deleteMultiple = async (
  items: { id: number; isFile: boolean; shared: boolean }[],
  pathName?: string,
) => {
  const response = await postData({
    url: '/api/file/delete-multiple',
    payload: { items, pathName },
  });

  if (response.success) {
    toast.success(response.message);
  } else {
    toast.error(response.message);
  }
  return response;
};

export const downloadMultiple = (selectedFiles: UploadedFile[]) => {
  const filesToDownload = selectedFiles;

  if (filesToDownload.length === 0) {
    toast.error('No downloadable files selected.');
    return;
  }

  if (filesToDownload.length === 1) {
    triggerHiddenDownload(
      `/api/file/download/file?fileId=${filesToDownload[0].id}`,
    );
    toast.success(`Downloading "${filesToDownload[0].name}"...`);
    return;
  }

  const idString = filesToDownload.map((f) => f.id).join(',');

  triggerHiddenDownload(
    `/api/file/download/multiple?ids=${encodeURIComponent(idString)}`,
  );
  toast.success(`Zipping ${filesToDownload.length} files...`);
};
