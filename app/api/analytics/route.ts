import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-response';
import { requireApiSession } from '@/lib/require-auth';
import { analyticsRepository } from '@/repositories/analytics.repository';
import type { AnalyticsDataPayload } from '@/types/analytics';

export async function GET(request: NextRequest) {
  const session = await requireApiSession(request);
  if (session instanceof NextResponse) return session;
  const userId = Number(session.userId);

  try {
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

    const payload: AnalyticsDataPayload = {
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

    return sendSuccess(payload, 'Analytics fetched', 200);
  } catch {
    return sendError('Failed to fetch analytics', 500);
  }
}
