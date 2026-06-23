import { sendError, sendSuccess } from "@/lib/api-response";
import { sharedWithMeRepository } from "@/repositories/shared-with-me.repository";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { id, newName } = await request.json();
  if (!id) {
    return sendError("Missing id", 400);
  }

  if (!newName) {
    return sendError("Missing newName", 400);
  }

  try {
    const response = await sharedWithMeRepository.renameSharedItem(
      Number(id),
      newName,
    );
    if (!response) {
      return sendError("Failed to rename item", 500);
    }
    return sendSuccess(null, "Item renamed successfully", 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(error.message, 500);
    }
  }
}
