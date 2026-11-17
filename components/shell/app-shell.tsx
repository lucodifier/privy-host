"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, KeyRound, LayoutDashboard, LogOut, Server, Users } from "lucide-react";
import type { ReactNode } from "react";
export function AppShell({ children, username, isRoot }: { children: ReactNode; username: string; isRoot: boolean }) {
  const pathname = usePathname();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }
  return <div className="host-shell"><aside className="host-sidebar">
    <Link href="/" className="host-logo"><span><Globe size={22} /></span>Priv Host</Link>
    <nav aria-label="Principal">
      <Link href="/" aria-current={pathname === "/" ? "page" : undefined}><LayoutDashboard size={18} />Dashboard</Link>
      <Link href="/systems" aria-current={pathname === "/systems" ? "page" : undefined}><Server size={18} />{isRoot ? "Sistemas" : "Meus sistemas"}</Link>
      {isRoot && <Link href="/users" aria-current={pathname === "/users" ? "page" : undefined}><Users size={18} />Usuários</Link>}
    </nav>
    <div className="sidebar-note sidebar-user">
      <strong>{username}</strong><span>{isRoot ? "Root" : "Admin de sistema"}</span>
      <Link href="/account"><KeyRound size={14} />Alterar senha</Link>
      <button type="button" onClick={logout}><LogOut size={14} />Sair</button>
    </div>
  </aside><main className="host-main">{children}</main></div>;
}
