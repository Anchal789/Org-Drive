import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionId = await getSessionUser();

  if (sessionId) {
    redirect("/my-drive");
  }
  return <>{children}</>;
}
