import { redirect } from 'next/navigation';
import AnalyticsPage from '@/components/analytics/AnalyticsPage';
import { getSessionUser } from '@/lib/session';
import { analyticsRepository } from '@/repositories/analytics.repository';
import type { AnalyticsDataPayload } from '@/types/analytics';

export default async function Analytics() {
  const session = await getSessionUser();
  if (!session?.userId) redirect('/login');
  const userId = Number(session.userId);

  const [
    overviewStats,
    recentActivity,
    storageByType,
    topContributors,
    folders,
    uploadsLast90Days,
  ] = await Promise.all([
    analyticsRepository.getOverviewStats(userId),
    analyticsRepository.getRecentActivity(userId),
    analyticsRepository.getStorageByType(userId),
    analyticsRepository.getTopContributors(userId),
    analyticsRepository.getFolderInsights(userId),
    analyticsRepository.getUploadsLast90Days(userId),
  ]);

  const totalBytes = folders.reduce((acc, f) => acc + f.sizeBytes, 0);

  const initialData: AnalyticsDataPayload = {
    overview: {
      ...overviewStats,
      storageByType,
      recentActivity,
      topContributors,
    },
    insights: {
      totalStorageGB: totalBytes / (1024 * 1024 * 1024),
      growthRate: '+8.4 GB / week',
      folders,
    },
    uploadsLast90Days,
  };

  return <AnalyticsPage initialData={initialData} />;
}
