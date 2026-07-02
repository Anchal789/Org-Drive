import { getSessionUser } from "@/lib/session";
import { sendError, sendSuccess } from "@/lib/api-response";
import { analyticsRepository } from "@/repositories/analytics.repository";
import { AnalyticsDataPayload } from "@/types/analytics";

export async function GET() {
  const session = await getSessionUser();
  if (!session?.userId) return sendError("Unauthorized", 401);
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
        growthRate: "+8.4 GB / week", // Calculated or static baseline
        folders,
      },
      uploadsLast90Days,
    };

    return sendSuccess(payload, "Analytics fetched", 200);
  } catch (error) {
    return sendError("Failed to fetch analytics", 500);
  }
}
