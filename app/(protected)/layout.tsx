import { redirect } from "next/navigation";
import DriveSidebar from "@/components/sidebar/DriveSidebar";
import { getSessionUser } from "@/lib/session";
import styles from "./layout.module.scss";
import DriveTopbar from "@/components/Header/DriveTopbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import ShareDialog from "@/components/share-module/ShareDialog/ShareDialog";
import { userRepository } from "@/repositories/user.repository";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const allUsers = await userRepository.getUsers();

  return (
    <TooltipProvider>
      <div className={styles.layoutWrapper}>
        <SidebarProvider>
          <DriveSidebar />
          <div className={styles.shell}>
            <div className={styles.main}>
              <DriveTopbar user={user} />
              <div className={styles.mainContent}>{children}</div>
            </div>
          </div>
          <ShareDialog userId={Number(user.userId)} allUsers={allUsers} />
        </SidebarProvider>
      </div>
    </TooltipProvider>
  );
}
