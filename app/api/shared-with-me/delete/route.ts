import { sendError, sendSuccess } from "@/lib/api-response";
import { getApiSession } from "@/lib/session";
import { decrypt } from "@/lib/utils";
import { sharedWithMeRepository } from "@/repositories/shared-with-me.repository";
import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest) {
  const session = await getApiSession(request);

  if (!session?.userId) return sendError("Unauthorized", 401);

  const url = new URL(request.url);
  const id = decrypt(url.searchParams.get("id") || "");

  if (!id) return sendError("File not found", 400);

  try {
    const deletedItem = await sharedWithMeRepository.deleteSharedItem(
      Number(id),
    );

    if (!deletedItem) return sendError("Item not found", 400);
    return sendSuccess(null, "Item moved to trash.", 200);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return sendError(errMsg, 500);
  }
}
