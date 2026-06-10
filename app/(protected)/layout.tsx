import DriveSidebar from "@/components/sidebar/DriveSidebar";
import { getSessionUserId } from "@/lib/session";
import { redirect } from "next/navigation";
import styles from "./layout.module.scss";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionId = await getSessionUserId();
  if (!sessionId) {
    redirect("/login");
  }

  return (
    <div className={styles.layoutWrapper}>
      <DriveSidebar />
      <div className={styles.mainContent}>{children}</div>
    </div>
  );
}
