import { getSessionUserId } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionId = await getSessionUserId();

  if (sessionId) {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
