import { toast } from "sonner";
import { deleteData, postData } from "@/lib/api-fn";
import { isTelegramSessionValid } from "@/lib/session";
import { encrypt } from "@/lib/utils";
import { UploadedFile } from "@/types/files";

export const downloadFile = async (fileId: number, userId?: number) => {
  const telegramSession = await isTelegramSessionValid();

  if (!telegramSession.valid) {
    toast.error(telegramSession.message);
    return;
  }

  window.location.href = `/api/file/download/file?fileId=${fileId}${userId ? `&userId=${userId}` : ""}`;
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

export const trashFile = async (fileId: number, shareId?: number) => {
  const response = await deleteData({
    url: "/api/file/delete-file",
    params: {
      fileId: encrypt(String(fileId)),
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

export const bookmarkItem = async (
  id: number,
  isFile: boolean,
  bookmark: boolean,
) => {
  const response = await postData({
    url: "/api/bookmark",
    payload: { id: encrypt(`${id}`), isFile, bookmark, shared: false },
  });

  if (response.success) {
    toast.success(response.message);
  } else {
    toast.error(response.message);
  }
  return response;
};

export const moveFile = async (filesId: number[], folderId: string) => {
  const response = await postData({
    url: "/api/move-file",
    payload: { filesId, folderId: Number(folderId) },
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
) => {
  const response = await postData({
    url: "/api/bookmark/all",
    payload: { items, bookmarkState },
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
) => {
  const response = await postData({
    url: "/api/file/delete-multiple",
    payload: { items },
  });

  if (response.success) {
    toast.success(response.message);
  } else {
    toast.error(response.message);
  }
  return response;
};

export const downloadMultiple = (selectedFiles: UploadedFile[]) => {
  const filesToDownload = selectedFiles.filter((f) => !f.folderId);

  if (filesToDownload.length === 0) {
    toast.error("No downloadable files selected.");
    return;
  }

  if (filesToDownload.length === 1) {
    window.open(
      `/api/file/download/file?fileId=${filesToDownload[0].id}`,
      "_blank",
    );
    toast.success(`Downloading ${filesToDownload[0].name}...`);
    return;
  }

  const ids = filesToDownload.map((f) => f.id).join(",");
  window.open(`/api/file/download/multiple?ids=${ids}`, "_blank");

  toast.success(`Zipping ${filesToDownload.length} files...`);
};
