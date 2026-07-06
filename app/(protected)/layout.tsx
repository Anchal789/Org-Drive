import { redirect } from 'next/navigation';
import DriveTopbar from '@/components/Header/DriveTopbar';
import TopbarWrapper from '@/components/Header/TopbarWrapper';
import ShareDialog from '@/components/share-module/ShareDialog/ShareDialog';
import DriveSidebar from '@/components/sidebar/DriveSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getSessionUser } from '@/lib/session';
import { bookmarkRepository } from '@/repositories/bookmark.repository';
import { sharedWithMeRepository } from '@/repositories/shared-with-me.repository';
import { uploadedFilesRepository } from '@/repositories/uploaded-files.respository';
import { userRepository } from '@/repositories/user.repository';
import styles from './layout.module.scss';

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }

  const [allUsers, fileFolderCount, sharedWithMeFileCount, bookmarksCount] =
    await Promise.all([
      userRepository.getUsers(),
      uploadedFilesRepository.fileFolderCount(Number(user.userId)),
      sharedWithMeRepository.getSharedWithMeFileCount(Number(user.userId)),
      bookmarkRepository.getBookmarksCount(Number(user.userId)),
    ]);

  return (
    <TooltipProvider>
      <div className={styles.layoutWrapper}>
        <SidebarProvider>
          <DriveSidebar
            fileFolderCount={fileFolderCount}
            sharedWithMeFileCount={sharedWithMeFileCount}
            bookmarksCount={bookmarksCount}
          />
          <div className={styles.shell}>
            <div className={styles.main}>
              <TopbarWrapper>
                <DriveTopbar user={user} />
              </TopbarWrapper>
              <div className={styles.mainContent}>{children}</div>
            </div>
          </div>
          <ShareDialog userId={Number(user.userId)} allUsers={allUsers} />
        </SidebarProvider>
      </div>
    </TooltipProvider>
  );
}
