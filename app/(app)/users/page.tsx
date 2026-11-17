import { redirect } from "next/navigation";
import { UsersWorkspace } from "@/components/users-workspace";
import { getCurrentUser } from "@/lib/auth";
export const metadata = { title: "Usuários" };

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (user?.role !== "root") redirect("/");
  return <UsersWorkspace />;
}
