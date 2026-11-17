import { redirect } from "next/navigation";
import { PasswordForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
export const metadata = { title: "Alterar senha" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <main className="auth-page"><PasswordForm forced={user.mustChangePassword} /></main>;
}
