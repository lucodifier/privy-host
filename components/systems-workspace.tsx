"use client";
import { PasswordInput } from "@/components/password-input";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, Copy, ExternalLink, Eye, EyeOff, Globe, Pencil, Plus, Search, Server, Trash2, X } from "lucide-react";
import { systemSchema, type Access, type System, type SystemInput } from "@/lib/systems";

const blank = (): SystemInput => ({ name: "", url: "", environment: "", accesses: [] });
const newAccess = (): Access => ({ id: crypto.randomUUID(), description: "", login: "", password: "" });

function Credential({ label, value, secret = false, notify }: { label: string; value: string; secret?: boolean; notify: (message: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
      notify(label + " copiado.");
    } catch { setVisible(true); notify("Não foi possível copiar. Selecione o texto e copie manualmente."); }
  }
  return <div className="credential"><span className="credential-label">{label}</span><div className="credential-value">
    <span className="credential-text">{secret && !visible ? "••••••••••••" : value}</span>
    {secret && <button type="button" className="icon-action" onClick={() => setVisible(!visible)} aria-label={visible ? "Ocultar senha" : "Mostrar senha"}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
    <button type="button" className="icon-action" onClick={copy} aria-label={"Copiar " + label.toLowerCase()} title={"Copiar " + label.toLowerCase()}>{copied ? <Check size={16} /> : <Copy size={16} />}</button>
  </div></div>;
}

function SystemEditor({ initial, isRoot, onClose, onSave }: { initial: System | null; isRoot: boolean; onClose: () => void; onSave: (input: SystemInput, id?: string) => Promise<void> }) {
  const [draft, setDraft] = useState<SystemInput>(() => initial ? { ...initial, accesses: initial.accesses.map(access => ({ ...access })) } : blank());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  function changeAccess(id: string, field: keyof Access, value: string) {
    setDraft(previous => ({ ...previous, accesses: previous.accesses.map(access => access.id === id ? { ...access, [field]: value } : access) }));
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = systemSchema.safeParse(draft);
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setSaving(true); setError("");
    try { await onSave(parsed.data, initial?.id); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar."); setSaving(false); }
  }
  return <dialog ref={dialog} className="system-dialog" onCancel={event => { event.preventDefault(); if (!saving) onClose(); }} aria-labelledby="editor-title">
    <form onSubmit={submit}>
      <div className="dialog-heading"><div><h2 id="editor-title">{initial ? "Editar sistema" : "Novo Sistema"}</h2><p>Cadastre o sistema e seus dados de acesso.</p></div><button type="button" className="icon-action" onClick={onClose} disabled={saving} aria-label="Fechar"><X size={20} /></button></div>
      <fieldset disabled={saving} className="editor-fields">
        <label>Nome do sistema<input autoFocus disabled={!isRoot && Boolean(initial)} required maxLength={120} value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} placeholder="Ex.: Portal do cliente" /></label>
        <label>URL do sistema<input type="url" disabled={!isRoot && Boolean(initial)} required value={draft.url} onChange={event => setDraft({ ...draft, url: event.target.value })} placeholder="https://sistema.exemplo.com.br" /></label>
        <label>Ambiente<input disabled={!isRoot && Boolean(initial)} required maxLength={80} list="environments" value={draft.environment} onChange={event => setDraft({ ...draft, environment: event.target.value })} placeholder="Ex.: Produção" /></label>
        <datalist id="environments"><option value="Produção" /><option value="Homologação" /><option value="Desenvolvimento" /></datalist>
        <div className="access-heading"><div><h3>Configurações de acesso</h3><p>Adicione os logins e senhas deste sistema.</p></div><button type="button" className="text-action" onClick={() => setDraft({ ...draft, accesses: [...draft.accesses, newAccess()] })}><Plus size={16} />Adicionar acesso</button></div>
        {draft.accesses.length === 0 && <p className="empty-access">Você pode cadastrar os acessos agora ou depois de salvar o sistema.</p>}
        {draft.accesses.map((access, index) => <section key={access.id} className="access-editor" aria-label={"Acesso " + (index + 1)}>
          <div className="access-editor-heading"><strong>Acesso {index + 1}</strong><button type="button" className="icon-action danger" aria-label={"Remover acesso " + (index + 1)} onClick={() => setDraft({ ...draft, accesses: draft.accesses.filter(item => item.id !== access.id) })}><Trash2 size={16} /></button></div>
          <label>Descrição<input required maxLength={120} value={access.description} onChange={event => changeAccess(access.id, "description", event.target.value)} placeholder="Ex.: Administrador" /></label>
          <div className="access-inputs"><label>Login<input required autoComplete="off" maxLength={300} value={access.login} onChange={event => changeAccess(access.id, "login", event.target.value)} placeholder="Usuário ou e-mail" /></label><label>Senha<PasswordInput required autoComplete="new-password" maxLength={2000} value={access.password} onChange={event => changeAccess(access.id, "password", event.target.value)} placeholder="Senha de acesso" /></label></div>
        </section>)}
      </fieldset>
      {error && <p role="alert" className="error-message">{error}</p>}
      <div className="dialog-footer"><button type="button" className="secondary-action" disabled={saving} onClick={onClose}>Cancelar</button><button className="primary-action" disabled={saving}>{saving ? "Salvando…" : "Salvar sistema"}</button></div>
    </form>
  </dialog>;
}

export function SystemsWorkspace({ view, isRoot }: { view: "dashboard" | "systems"; isRoot: boolean }) {
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<{ system: System | null } | null>(null);
  const [deleting, setDeleting] = useState<System | null>(null);
  const [busy, setBusy] = useState(false);
  const dashboard = view === "dashboard";
  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/systems", { cache: "no-store" });
      const data = await response.json();
      if (response.status === 401) { window.location.href = "/login"; return; }
      if (!response.ok) throw new Error(data.error);
      setSystems(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível carregar os sistemas."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function save(input: SystemInput, id?: string) {
    const response = await fetch("/api/systems", { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...input, id }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    setSystems(previous => id ? previous.map(system => system.id === id ? data : system) : [data, ...previous]);
    setEditor(null); setMessage("Sistema salvo.");
  }
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      const response = await fetch("/api/systems", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleting.id }) });
      if (!response.ok) throw new Error((await response.json()).error);
      setSystems(previous => previous.filter(system => system.id !== deleting.id));
      setDeleting(null); setMessage("Sistema excluído.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível excluir."); }
    finally { setBusy(false); }
  }
  const filtered = systems.filter(system => [system.name, system.url, system.environment, ...system.accesses.map(access => access.description)].join(" ").toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));
  return <>
    <header className="page-heading"><div><p className="eyebrow">PRIV HOST</p><h1>{dashboard ? "Dashboard" : "Sistemas"}</h1><p>{dashboard ? "Abra seus sistemas e copie os dados para entrar." : "Cadastre seus sistemas, ambientes e configurações de acesso."}</p></div>{dashboard ? <Link className="secondary-action" href="/systems"><Server size={16} />Gerenciar sistemas</Link> : <button className="primary-action" onClick={() => setEditor({ system: null })}><Plus size={17} />Novo Sistema</button>}</header>
    <section className="workspace-section" aria-label={dashboard ? "Seus acessos" : "Sistemas cadastrados"}>
      <div className="list-toolbar"><div><h2>{dashboard ? "Seus sistemas" : "Sistemas cadastrados"}{!loading && <span className="count">{systems.length}</span>}</h2><p>{dashboard ? "Tudo o que você precisa para acessar seus sistemas." : "Organize os acessos de cada sistema em um único lugar."}</p></div><div className="system-search"><Search size={16} /><input type="search" aria-label="Buscar sistemas" placeholder="Buscar sistema ou ambiente…" value={query} onChange={event => setQuery(event.target.value)} /></div></div>
      {error && <div role="alert" className="error-message">{error} <button className="text-action" onClick={load}>Tentar novamente</button></div>}
      {loading ? <div className="empty-state">Carregando sistemas…</div> : !error && filtered.length === 0 ? <div className="empty-state"><span className="empty-icon"><Server size={28} /></span><h3>{query ? "Nenhum sistema encontrado" : "Seu primeiro sistema começa aqui"}</h3><p>{query ? "Tente buscar por outro nome ou ambiente." : "Cadastre a URL, o ambiente e os dados de acesso do seu sistema."}</p>{!query && (dashboard ? <Link className="primary-action" href="/systems">Cadastrar sistema</Link> : <button className="primary-action" onClick={() => setEditor({ system: null })}><Plus size={16} />Novo Sistema</button>)}</div> : <div className="systems-grid">{filtered.map(system => <article className="system-card" key={system.id}>
        <div className="system-card-heading"><span className="system-icon"><Globe size={21} /></span><div><h3><a href={system.url} target="_blank" rel="noopener noreferrer">{system.name}</a></h3><span className="environment">{system.environment}</span></div>{!dashboard && <div className="card-actions"><button className="icon-action" aria-label={"Editar " + system.name} onClick={() => setEditor({ system })}><Pencil size={16} /></button>{isRoot && <button className="icon-action danger" aria-label={"Excluir " + system.name} onClick={() => setDeleting(system)}><Trash2 size={16} /></button>}</div>}</div>
        <a className="system-url" href={system.url} target="_blank" rel="noopener noreferrer"><span>{system.url}</span><ExternalLink size={14} /></a>
        <div className="system-accesses">{system.accesses.length ? system.accesses.map(access => <section className="access-block" key={access.id} aria-label={access.description}><h4>{access.description}</h4><Credential label="Login" value={access.login} notify={setMessage} /><Credential label="Senha" value={access.password} secret notify={setMessage} /></section>) : <div className="no-access"><p>Nenhum acesso cadastrado.</p><button className="text-action" onClick={() => setEditor({ system })}><Plus size={15} />Adicionar configuração</button></div>}</div>
        <div className="system-card-footer">{dashboard ? <a className="open-system" href={system.url} target="_blank" rel="noopener noreferrer">Abrir sistema<ExternalLink size={15} /></a> : <button className="open-system" onClick={() => setEditor({ system })}>Configurar acessos<Pencil size={14} /></button>}</div>
      </article>)}</div>}
    </section>
    <p className="feedback" role="status" aria-live="polite">{message}</p>
    {editor && <SystemEditor initial={editor.system} isRoot={isRoot} onClose={() => setEditor(null)} onSave={save} />}
    {deleting && <DeleteDialog system={deleting} busy={busy} onCancel={() => setDeleting(null)} onConfirm={remove} />}
  </>;
}
function DeleteDialog({ system, busy, onCancel, onConfirm }: { system: System; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  return <dialog ref={dialog} className="system-dialog delete-dialog" aria-labelledby="delete-title" onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}><h2 id="delete-title">Excluir sistema?</h2><p>O sistema <strong>{system.name}</strong> e suas configurações de acesso serão excluídos.</p><div className="dialog-footer"><button autoFocus className="secondary-action" disabled={busy} onClick={onCancel}>Cancelar</button><button className="primary-action delete-action" disabled={busy} onClick={onConfirm}>{busy ? "Excluindo…" : "Excluir sistema"}</button></div></dialog>;
}

