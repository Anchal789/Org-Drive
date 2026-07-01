import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/session";
import { sendError, sendSuccess } from "@/lib/api-response";
import { searchRepository } from "@/repositories/search.repository";

export async function GET(request: NextRequest) {
  const session = await getSessionUser();
  if (!session?.userId) return sendError("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim() === "") {
    return sendSuccess({ files: [], folders: [] }, "Empty search", 200);
  }

  try {
    const results = await searchRepository.searchFilesAndFolders(
      Number(session.userId),
      q,
    );

    return sendSuccess(results, "Search completed", 200);
  } catch (error: unknown) {
    console.error("Search API Error:", error);
    return sendError("Failed to perform search", 500);
  }
}
