import { sendError, sendSuccess } from "@/lib/api-response";
import { getApiSession } from "@/lib/session";
import { uploadedFoldersRepository } from "@/repositories/uploaded-folders.respository";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getApiSession(request);
  if (!session || !session.userId) {
    return sendError("Access token missing or expired", 401);
  }
  try {
    const folders = await uploadedFoldersRepository.getAllFoldersWithIdName(
      Number(session.userId),
    );
    return sendSuccess(folders, "Folders fetched successfully", 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(error.message, 500);
    }
  }
}
