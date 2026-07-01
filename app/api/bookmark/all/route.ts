import { sendError, sendSuccess } from "@/lib/api-response";
import { bookmarkRepository } from "@/repositories/bookmark.repository";

export async function POST(request: Request) {
  try {
    const { items, bookmarkState } = await request.json();

    if (!items || !Array.isArray(items)) {
      return sendError("Invalid payload", 400);
    }

    await bookmarkRepository.bookmarkMultipleItems(items, bookmarkState);

    return sendSuccess(
      null,
      `Items ${bookmarkState ? "bookmarked" : "unbookmarked"} successfully`,
      200,
    );
  } catch (error) {
    if (error instanceof Error) {
      return sendError(error.message, 500);
    }
    return sendError("An unknown error occurred", 500);
  }
}
