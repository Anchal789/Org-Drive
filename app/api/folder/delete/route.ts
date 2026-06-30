import { sendError, sendSuccess } from "@/lib/api-response";
import { decrypt } from "@/lib/utils";
import { uploadedFoldersRepository } from "@/repositories/uploaded-folders.respository";

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = decrypt(url.searchParams.get("id") || "");
  const shareId = decrypt(url.searchParams.get("shareId") || "");

  if (!id) return sendError("File not found", 400);

  try {
    const deletedFolder = await uploadedFoldersRepository.deleteFolder(
      Number(id),
      Number(shareId),
    );

    if (!deletedFolder) return sendError("Folder not found", 400);
    return sendSuccess(null, "Folder moved to trash.", 200);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return sendError(errMsg, 500);
  }
}
