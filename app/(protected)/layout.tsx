import DriveSidebar from "@/components/sidebar/DriveSidebar";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import styles from "./layout.module.scss";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionId = await getSessionUser();
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
