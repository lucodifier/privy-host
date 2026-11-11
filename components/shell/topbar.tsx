"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Bell, Menu, Plus, Search } from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/credentials?q=${encodeURIComponent(trimmed)}` : "/credentials");
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-canvas/85 px-3 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Abrir menu"
        className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-ink md:hidden"
      >
        <Menu size={17} />
      </button>

      <form onSubmit={onSubmit} role="search" className="relative hidden w-full max-w-sm md:block">
        <Search
          size={14}
          aria-hidden
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar credenciais, projetos…"
          aria-label="Pesquisa global"
          className="h-8 w-full rounded-md border border-line bg-panel pl-8 pr-14 text-[13px] text-ink placeholder:text-muted/80 transition-colors hover:border-[#404654] focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-line bg-surface px-1.5 py-px font-sans text-[10px] leading-4 text-muted">
          ⌘K
        </kbd>
      </form>

      <div className="ml-auto flex items-center gap-2">
        <IconButton label="Notificações" className="hidden sm:inline-flex">
          <Bell size={15} strokeWidth={1.8} />
        </IconButton>
        <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
        <Button variant="primary" size="md">
          <Plus size={14} strokeWidth={2.2} aria-hidden />
          Novo segredo
        </Button>
        <span
          className="flex size-7 items-center justify-center rounded-full bg-surface text-[11px] font-medium text-ink"
          title="Ana Ribeiro"
        >
          AR
        </span>
      </div>
    </header>
  );
}
