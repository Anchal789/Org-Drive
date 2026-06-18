import { sendError, sendSuccess } from "@/lib/api-response";
import { getSessionUser } from "@/lib/session";
import { trashedItemsRepository } from "@/repositories/trashed-items.repository";

export async function GET() {
  const user = await getSessionUser();
  const trastedItems = await trashedItemsRepository.getTrashedItems(
    Number(user?.userId),
  );

  if (!trastedItems) {
    return sendError("No trashed items found", 404);
  }

  return sendSuccess(trastedItems);
}
