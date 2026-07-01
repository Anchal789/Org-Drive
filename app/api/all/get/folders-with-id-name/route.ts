import { sendError, sendSuccess } from "@/lib/api-response";
import { uploadedFoldersRepository } from "@/repositories/uploaded-folders.respository";

export async function GET() {
  try {
    const folders = await uploadedFoldersRepository.getAllFoldersWithIdName();
    return sendSuccess(folders, "Folders fetched successfully", 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(error.message, 500);
    }
  }
}
