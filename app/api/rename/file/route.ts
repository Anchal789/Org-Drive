import { sendError, sendSuccess } from "@/lib/api-response";
import { getApiSession } from "@/lib/session";
import { uploadedFilesRepository } from "@/repositories/uploaded-files.respository";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const user = await getApiSession(request);

  if (!user || !user.userId) {
    return sendError("Access token missing or expired", 401);
  }

  const { id, newName } = await request.json();

  if (!id) return sendError("Missing id", 400);
  if (!newName) return sendError("Missing new name", 400);

  const actorId = Number(user?.userId);

  try {
    const response = await uploadedFilesRepository.renameFile(
      Number(id),
      newName,
      actorId,
    );

    if (!response) {
      return sendError("Failed to rename item", 500);
    }

    return sendSuccess(null, "File renamed successfully", 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(error.message, 500);
    }
    return sendError("Internal Server Error", 500);
  }
}
