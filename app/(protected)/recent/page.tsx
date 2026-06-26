import { getSessionUser } from "@/lib/session";
import { recentRepository } from "@/repositories/recent.repository";
import dynamic from "next/dynamic";

const RecentPage = dynamic(
  () => import("@/components/recent-module/RecentPage"),
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
