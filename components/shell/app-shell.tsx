"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, LayoutDashboard, Server } from "lucide-react";
import type { ReactNode } from "react";
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <div className="host-shell"><aside className="host-sidebar">
    <Link href="/" className="host-logo"><span><Globe size={22} /></span>Priv Host</Link>
    <nav aria-label="Principal">
      <Link href="/" aria-current={pathname === "/" ? "page" : undefined}><LayoutDashboard size={18} />Dashboard</Link>
      <Link href="/systems" aria-current={pathname === "/systems" ? "page" : undefined}><Server size={18} />Sistemas</Link>
    </nav><p className="sidebar-note">Seus sistemas e acessos,<br />em um só lugar.</p>
  </aside><main className="host-main">{children}</main></div>;
}

