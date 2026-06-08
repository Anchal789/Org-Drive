import { getSessionUserId } from "@/lib/session";
import DashGridShare from "@/components/dashboard/DashGridShare";
import DashFolder from "@/components/dashboard/DashFolder";
import DashGrid from "@/components/dashboard/DashGrid";

const Dashboard = async () => {
  const userId = await getSessionUserId();

  return <DashGrid showDropOverlay />;
};

export default Dashboard;
