import { postData } from "@/lib/api-fn";

export const renameSharedItem = async (id: number, newName: string) => {
  const response = await postData({
    url: "/api/shared-with-me/rename",
    payload: { id, newName },
  });
  return response;
};
