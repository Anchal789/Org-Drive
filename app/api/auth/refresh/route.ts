import { cookies } from "next/headers";
import { verifyToken, generateAccessToken } from "@/lib/jwt";
import { sendError, sendSuccess } from "@/lib/api-response";

export async function POST() {
  // 1. Grab the refresh token safely from the httpOnly cookie
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return sendError("No refresh token found", 401);
  }

  // 2. Verify the refresh token is still valid (within the 7 days)
  const payload = await verifyToken(refreshToken);

  if (!payload || !payload.userId) {
    return sendError("Invalid or expired refresh token", 403);
  }

  const newAccessToken = await generateAccessToken(
    payload.userId as string,
    payload.telegramId as string,
    payload.firstName as string,
    payload.lastName as string,
    payload.username as string,
    payload.photoUrl as string,
  );

  // 4. Send the new Access Token back to the frontend
  return sendSuccess({ accessToken: newAccessToken });
}
