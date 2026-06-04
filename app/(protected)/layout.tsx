import DriveSidebar from "@/components/dashboard/DriveSidebar";
import { getSessionUserId } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionId = await getSessionUserId();

  if (!sessionId) {
    redirect("/login");
  }
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        background: "v(background)",
        color: "v(foreground)",
        fontFamily: "v(font-sans)",
        position: "relative",
      }}
    >
      <DriveSidebar />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
