import { NextResponse } from "next/server";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { pendingLoginRepository } from "@/repositories/pending-login.repository";

export async function POST(request: Request) {
  const { phoneNumber } = await request.json();

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
    return NextResponse.json(
      { success: false, error: "Failed to connect to Telegram" },
      { status: 500 },
    );
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
  } catch (error: any) {
    await client.disconnect();
    console.error(
      "sendCode failed:",
      error?.errorMessage ?? error?.message,
      error,
    );
    return NextResponse.json(
      {
        success: false,
        error:
          error?.errorMessage === "PHONE_NUMBER_INVALID"
            ? "Invalid phone number"
            : "Failed to send code",
      },
      { status: 400 },
    );
  }

  const partialSession = client.session.save() as unknown as string;

  if (!result?.phoneCodeHash) {
    await client.disconnect();
    return NextResponse.json(
      { success: false, error: "Failed to send code" },
      { status: 500 },
    );
  }

  await pendingLoginRepository.create({
    phone: phoneNumber,
    phoneCodeHash: result.phoneCodeHash,
    session: partialSession,
  });

  await client.disconnect();
  return NextResponse.json({
    success: true,
    phoneCodeHash: result.phoneCodeHash,
  });
}
