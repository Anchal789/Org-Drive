import { postData } from "@/lib/api-fn";

export const renameItem = async (
  id: number,
  newName: string,
  isFile: boolean,
  shareId?: number,
) => {
  const response = await postData({
    url: "/api/rename/" + (isFile ? "file" : "folder"),
    payload: { id, newName, shareId },
  });
  return response;
};
