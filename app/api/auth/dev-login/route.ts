import { type NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session";
import { userRepository } from "@/repositories/user.repository";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Dev login disabled in production" },
      { status: 403 },
    );
  }
  const targetUserId = 31;
  const user = await userRepository.findById(targetUserId);

  if (!user) {
    return NextResponse.json(
      { error: "Hardcoded user not found in DB" },
      { status: 404 },
    );
  }

  await createSession({
    userId: String(user.id),
    telegramId: String(user.telegramId),
    telegramSessionString: user.telegramSessionString,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    photoUrl: user.photoUrl,
  });

  return NextResponse.redirect(new URL("/my-drive", request.url));
}
