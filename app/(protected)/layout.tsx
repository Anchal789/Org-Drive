import { redirect } from "next/navigation";
import DriveSidebar from "@/components/sidebar/DriveSidebar";
import { getSessionUser } from "@/lib/session";
import styles from "./layout.module.scss";
import DriveTopbar from "@/components/Header/DriveTopbar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <TooltipProvider>
      <div className={styles.layoutWrapper}>
        <DriveSidebar />
        <div
          className={styles.shell}
          data-screen-label="02 Drive · Inside folder"
        >
          <div className={styles.main}>
            <DriveTopbar user={user} />
            <div className={styles.mainContent}>{children}</div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
