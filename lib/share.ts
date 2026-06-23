"use server";

import { uploadedFoldersRepository } from "@/repositories/uploaded-folders.respository";

export async function fetchFolderFromFile(userId: number, id: number) {
  const response = await uploadedFoldersRepository.getFolder(userId, id);
  return response;
}
