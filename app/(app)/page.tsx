import { DashboardView } from "@/components/dashboard-view";
import { getCurrentUser } from "@/lib/auth";
export default async function DashboardPage() {
  const user = await getCurrentUser();
  return <DashboardView isRoot={user?.role === "root"} />;
}
