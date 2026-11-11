"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronsUpDown,
  Clock3,
  FolderClosed,
  KeyRound,
  LayoutDashboard,
  Settings,
  Star,
  X,
} from "lucide-react";
import { Logo } from "@/components/shell/logo";
import { cn } from "@/lib/utils";
import { currentUser } from "@/lib/data";

const primaryNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderClosed, count: "5" },
  { href: "/credentials", label: "All Credentials", icon: KeyRound, count: "148" },
  { href: "/favorites", label: "Favorites", icon: Star, count: "4" },
  { href: "/recent-access", label: "Recent Access", icon: Clock3 },
];

const secondaryNav = [{ href: "/settings", label: "Settings", icon: Settings }];

function NavItem({
  href,
  label,
  icon: Icon,
  count,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof KeyRound;
  count?: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-8 items-center gap-2.5 rounded-md pl-3 pr-2 text-[13px] transition-colors",
        active
          ? "bg-brand/10 font-medium text-ink"
          : "text-muted hover:bg-surface/60 hover:text-ink",
      )}
    >
      {active ? (
        <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-brand" aria-hidden />
      ) : null}
      <Icon
        size={15}
        strokeWidth={1.8}
        aria-hidden
        className={cn("shrink-0", active ? "text-brand" : "text-muted group-hover:text-ink")}
      />
      <span className="truncate">{label}</span>
      {count ? (
        <span className="ml-auto rounded px-1.5 py-0.5 text-[11px] tabular-nums text-muted">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[236px] flex-col border-r border-line bg-panel transition-transform duration-200 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-line px-3.5">
          <Link href="/" onClick={onClose} className="rounded focus-visible:outline-offset-4">
            <Logo />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="inline-flex size-7 items-center justify-center rounded text-muted hover:bg-surface hover:text-ink md:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <button
          type="button"
          className="mx-2.5 mt-3 flex items-center gap-2.5 rounded-md border border-line bg-surface/50 px-2.5 py-1.5 text-left transition-colors hover:border-[#404654] hover:bg-surface"
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded bg-brand/15 text-[10px] font-semibold uppercase text-brand-light">
            {currentUser.workspace.slice(0, 2)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] font-medium text-ink">
              {currentUser.workspace}
            </span>
            <span className="block text-[10.5px] leading-tight text-muted">Workspace</span>
          </span>
          <ChevronsUpDown size={13} className="shrink-0 text-muted" aria-hidden />
        </button>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2.5" aria-label="Principal">
          {primaryNav.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} onNavigate={onClose} />
          ))}

          <div className="my-2 h-px bg-line/70" />

          {secondaryNav.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} onNavigate={onClose} />
          ))}
        </nav>

        <div className="border-t border-line p-2.5">
          <div className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface text-[11px] font-medium text-ink">
              AR
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-medium text-ink">
                {currentUser.name}
              </span>
              <span className="block truncate text-[11px] text-muted">{currentUser.role}</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
