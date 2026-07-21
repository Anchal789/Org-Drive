import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { recentRepository } from '@/repositories/recent.repository';

const RecentPage = dynamic(
  () => import('@/components/recent-module/RecentPage'),
);

const Recent = async () => {
  const user = await getSessionUser();
  if (!user?.userId) redirect('/login');
  const userId = Number(user.userId);
  const recentLogs = await recentRepository.getRecentFiles(userId);

  return <RecentPage recentLogs={recentLogs} currentUserId={userId} />;
};

export default Recent;
