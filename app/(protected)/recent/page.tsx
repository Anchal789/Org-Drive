import dynamic from 'next/dynamic';
import { getSessionUser } from '@/lib/session';
import { recentRepository } from '@/repositories/recent.repository';

const RecentPage = dynamic(
  () => import('@/components/recent-module/RecentPage'),
);

const Recent = async () => {
  const user = await getSessionUser();
  const recentLogs = await recentRepository.getRecentFiles(
    Number(user?.userId),
  );

  return (
    <RecentPage recentLogs={recentLogs} currentUserId={Number(user?.userId)} />
  );
};

export default Recent;
