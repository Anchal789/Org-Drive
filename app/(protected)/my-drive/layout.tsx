import { Suspense } from 'react';
import DriveCrumb from '@/components/dashboard/DriveCrumb/DriveCrumb';
import SearchBar from '@/components/dashboard/DriveCrumb/SearchBar';
import styles from '@/components/dashboard/GridSection/DashGrid.module.scss';

export default function MyDriveLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className={styles.header}>
        <SearchBar />
        <Suspense fallback={null}>
          <DriveCrumb />
        </Suspense>
      </div>
      {children}
    </>
  );
}
