"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ExternalLink, KeyRound, Layers, Search, Server, ShieldAlert, User } from "lucide-react";
import type { System } from "@/lib/systems";

function CopyChip({ label, value, icon }: { label: string; value: string; icon: "login" | "senha" }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* sem permissão de clipboard */ }
  }
  return <button type="button" className="dash-chip" onClick={copy} title={"Copiar " + label.toLowerCase()}>
    {done ? <Check size={13} /> : icon === "login" ? <User size={13} /> : <KeyRound size={13} />}{done ? "Copiado" : label}
  </button>;
}

export function DashboardView() {
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [env, setEnv] = useState<string | null>(null);
  const [open, setOpen] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/systems", { cache: "no-store" }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSystems(data);
    }).catch(cause => setError(cause instanceof Error ? cause.message : "Não foi possível carregar os sistemas.")).finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const byEnv = new Map<string, number>();
    systems.forEach(system => byEnv.set(system.environment, (byEnv.get(system.environment) ?? 0) + 1));
    return {
      accesses: systems.reduce((total, system) => total + system.accesses.length, 0),
      withoutAccess: systems.filter(system => system.accesses.length === 0).length,
      envs: [...byEnv.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [systems]);

  const filtered = systems.filter(system =>
    (!env || system.environment === env) &&
    [system.name, system.url, system.environment, ...system.accesses.map(access => access.description)].join(" ").toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));
  const max = Math.max(1, ...stats.envs.map(([, count]) => count));
  const toggle = (id: string) => setOpen(previous => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  return <>
    <header className="page-heading"><div><p className="eyebrow">PRIV HOST</p><h1>Dashboard</h1><p>Visão geral dos seus sistemas e acesso rápido.</p></div><Link className="secondary-action" href="/systems"><Server size={16} />Gerenciar sistemas</Link></header>
    {error && <div role="alert" className="error-message">{error}</div>}
    <section className="dash-stats" aria-label="Resumo">
      <div className="dash-stat"><span className="dash-stat-icon"><Server size={18} /></span><strong>{loading ? "–" : systems.length}</strong><span>Sistemas</span></div>
      <div className="dash-stat"><span className="dash-stat-icon"><KeyRound size={18} /></span><strong>{loading ? "–" : stats.accesses}</strong><span>Acessos</span></div>
      <div className="dash-stat"><span className="dash-stat-icon"><Layers size={18} /></span><strong>{loading ? "–" : stats.envs.length}</strong><span>Ambientes</span></div>
      <div className={"dash-stat" + (stats.withoutAccess ? " warn" : "")}><span className="dash-stat-icon"><ShieldAlert size={18} /></span><strong>{loading ? "–" : stats.withoutAccess}</strong><span>Sem acesso cadastrado</span></div>
    </section>

    {!loading && systems.length > 0 && <section className="dash-panel" aria-label="Sistemas por ambiente">
      <h2>Sistemas por ambiente</h2>
      <div className="dash-bars">{stats.envs.map(([name, count]) =>
        <button type="button" key={name} className={"dash-bar" + (env === name ? " active" : "")} onClick={() => setEnv(env === name ? null : name)} aria-pressed={env === name}>
          <span className="dash-bar-name">{name}</span><span className="dash-bar-track"><span className="dash-bar-fill" style={{ width: (count / max) * 100 + "%" }} /></span><span className="dash-bar-count">{count}</span>
        </button>)}</div>
    </section>}

    <section className="dash-panel" aria-label="Lista de sistemas">
      <div className="list-toolbar"><div><h2>Acesso rápido{env && <span className="count">{env}</span>}</h2></div><div className="system-search"><Search size={16} /><input type="search" aria-label="Buscar sistemas" placeholder="Buscar sistema ou ambiente…" value={query} onChange={event => setQuery(event.target.value)} /></div></div>
      {loading ? <div className="empty-state">Carregando…</div> : filtered.length === 0 ? <div className="empty-state"><span className="empty-icon"><Server size={28} /></span><h3>{systems.length ? "Nenhum sistema encontrado" : "Seu primeiro sistema começa aqui"}</h3><p>{systems.length ? "Tente outro termo ou limpe o filtro de ambiente." : "Cadastre a URL, o ambiente e os dados de acesso."}</p>{!systems.length && <Link className="primary-action" href="/systems">Cadastrar sistema</Link>}</div> :
        <ul className="dash-list">{filtered.map(system => <li key={system.id} className="dash-row">
          <div className="dash-row-main">
            <div className="dash-row-title"><strong>{system.name}</strong><span className="environment">{system.environment}</span></div>
            <span className="dash-row-url">{system.url}</span>
          </div>
          <span className="dash-row-count">{system.accesses.length} {system.accesses.length === 1 ? "acesso" : "acessos"}</span>
          <div className="dash-row-actions">
            {system.accesses.length > 0 && <button type="button" className="secondary-action dash-small" onClick={() => toggle(system.id)} aria-expanded={open.has(system.id)}>Acessos<ChevronDown size={14} className={open.has(system.id) ? "dash-rot" : ""} /></button>}
            <a className="primary-action dash-small" href={system.url} target="_blank" rel="noopener noreferrer">Abrir<ExternalLink size={14} /></a>
          </div>
          {open.has(system.id) && <div className="dash-accesses">{system.accesses.map(access => <div key={access.id} className="dash-access"><span>{access.description}</span><div><CopyChip label="Login" value={access.login} icon="login" /><CopyChip label="Senha" value={access.password} icon="senha" /></div></div>)}</div>}
        </li>)}</ul>}
    </section>
  </>;
}
