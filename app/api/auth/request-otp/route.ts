import { NextRequest } from "next/server";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { pendingLoginRepository } from "@/repositories/pending-login.repository";
import { sendSuccess, sendError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const { phoneNumber } = await request.json();

  if (!phoneNumber) {
    return sendError("Phone number is required", 400);
  }

  const stringSession = new StringSession("");
  const client = new TelegramClient(
    stringSession,
    Number(process.env.TELEGRAM_APP_API_ID),
    String(process.env.TELEGRAM_APP_API_HASH),
    {
      connectionRetries: 5,
    },
  );

  try {
    await client.connect();
  } catch (_error) {
    return sendError("Failed to connect to Telegram", 500);
  }

  let result: { phoneCodeHash: string; isCodeViaApp: boolean } | null = null;
  try {
    result = await client.sendCode(
      {
        apiId: Number(process.env.TELEGRAM_APP_API_ID),
        apiHash: String(process.env.TELEGRAM_APP_API_HASH),
      },
      phoneNumber,
    );
  } catch (err: unknown) {
    await client.disconnect();
    const errMsg = err instanceof Error ? err.message : String(err);

    console.error("sendCode failed:", errMsg ?? err?.errorMessage ?? err);

    const errorMessage =
      err?.errorMessage === "PHONE_NUMBER_INVALID"
        ? "Invalid phone number"
        : "Failed to send code";

    return sendError(errorMessage, 400);
  }

  const partialSession = client.session.save() as unknown as string;

  if (!result?.phoneCodeHash) {
    await client.disconnect();
    return sendError("Failed to generate phone code hash", 500);
  }

  await pendingLoginRepository.create({
    phone: phoneNumber,
    phoneCodeHash: result.phoneCodeHash,
    session: partialSession,
  });

  await client.disconnect();

  return sendSuccess(
    {
      phoneCodeHash: result.phoneCodeHash,
      isCodeViaApp: result.isCodeViaApp,
    },
    "OTP sent successfully",
  );
}
