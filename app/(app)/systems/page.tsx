import { SystemsWorkspace } from "@/components/systems-workspace";
import { getCurrentUser } from "@/lib/auth";
export default async function SystemsPage() {
  const user = await getCurrentUser();
  return <SystemsWorkspace view="systems" isRoot={user?.role === "root"} />;
}
