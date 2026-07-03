import { sendError, sendSuccess } from "@/lib/api-response";
import { getApiSession } from "@/lib/session";
import { uploadedFoldersRepository } from "@/repositories/uploaded-folders.respository";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const session = await getApiSession(request);

  if (!session?.userId) return sendError("Unauthorized", 401);

  const { id, newName } = await request.json();
  if (!id) {
    return sendError("Missing id", 400);
  }

  if (!newName) {
    return sendError("Missing new name", 400);
  }

  try {
    const response = await uploadedFoldersRepository.renameFolder(
      Number(id),
      newName,
    );
    if (!response) {
      return sendError("Failed to rename item", 500);
    }
    return sendSuccess(null, "Folder renamed successfully", 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(error.message, 500);
    }
  }
}
