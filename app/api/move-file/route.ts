import { sendError, sendSuccess } from "@/lib/api-response";
import { uploadedFilesRepository } from "@/repositories/uploaded-files.respository";

export async function POST(request: Request) {
  const { filesId, folderId } = await request.json();

  if (!filesId || filesId.length === 0) {
    return sendError("Missing filesId or folderId", 400);
  }

  try {
    const response = await uploadedFilesRepository.moveFiles(filesId, folderId);

    if (!response) {
      return sendError("Failed to move files", 500);
    }

    return sendSuccess(null, "Files moved successfully", 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(error.message, 500);
    }
  }
}
