"use client";
import { PasswordInput } from "@/components/password-input";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Pencil, Plus, Power, Trash2, UserRound, X } from "lucide-react";
import type { System } from "@/lib/systems";
import type { AppUser } from "@/lib/users";

async function api(method: string, body?: unknown) {
  const response = await fetch("/api/users", { method, headers: { "Content-Type": "application/json" }, cache: "no-store", body: body ? JSON.stringify(body) : undefined });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) window.location.href = "/login";
  if (!response.ok) throw new Error(data.error ?? "Não foi possível concluir.");
  return data;
}

function UserEditor({ initial, systems, onClose, onSaved }: { initial: AppUser | null; systems: System[]; onClose: () => void; onSaved: () => Promise<void> }) {
  const [username, setUsername] = useState(initial?.username ?? "");
  const [password, setPassword] = useState("");
  const [systemIds, setSystemIds] = useState<string[]>(initial?.systemIds ?? []);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  const toggle = (id: string) => setSystemIds(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      if (initial) await api("PUT", { id: initial.id, systemIds, ...(password ? { password } : {}) });
      else await api("POST", { username, password, systemIds });
      await onSaved();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar."); setSaving(false); }
  }
  return <dialog ref={dialog} className="system-dialog" onCancel={event => { event.preventDefault(); if (!saving) onClose(); }} aria-labelledby="user-title">
    <form onSubmit={submit}>
      <div className="dialog-heading"><div><h2 id="user-title">{initial ? "Editar usuário" : "Novo usuário"}</h2><p>O usuário vê e edita os acessos apenas dos sistemas marcados abaixo.</p></div><button type="button" className="icon-action" onClick={onClose} disabled={saving} aria-label="Fechar"><X size={20} /></button></div>
      <fieldset disabled={saving} className="editor-fields">
        <label>Usuário<input autoFocus required disabled={Boolean(initial)} autoComplete="off" value={username} onChange={event => setUsername(event.target.value)} placeholder="Ex.: maria.silva" /></label>
        <label>{initial ? "Nova senha (deixe vazio para manter)" : "Senha inicial (mín. 10 caracteres)"}<PasswordInput required={!initial} minLength={initial ? undefined : 10} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} /></label>
        <div className="editor-fields"><span style={{ fontSize: 12, fontWeight: 500 }}>Sistemas que este usuário administra</span>
          <div className="system-picks">{systems.length === 0 ? <span className="empty-access">Cadastre sistemas primeiro.</span> : systems.map(system => <label key={system.id} className="system-pick"><input type="checkbox" checked={systemIds.includes(system.id)} onChange={() => toggle(system.id)} />{system.name} <span className="environment" style={{ marginTop: 0 }}>{system.environment}</span></label>)}</div>
        </div>
      </fieldset>
      {error && <p role="alert" className="error-message">{error}</p>}
      <div className="dialog-footer"><button type="button" className="secondary-action" disabled={saving} onClick={onClose}>Cancelar</button><button className="primary-action" disabled={saving}>{saving ? "Salvando…" : "Salvar usuário"}</button></div>
    </form>
  </dialog>;
}

export function UsersWorkspace() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<{ user: AppUser | null } | null>(null);
  const [deleting, setDeleting] = useState<AppUser | null>(null);
  async function load() {
    setError("");
    try {
      const [usersData, systemsResponse] = await Promise.all([api("GET"), fetch("/api/systems", { cache: "no-store" })]);
      const systemsData = await systemsResponse.json();
      if (!systemsResponse.ok) throw new Error(systemsData.error);
      setUsers(usersData); setSystems(systemsData);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível carregar."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function run(action: () => Promise<unknown>) {
    try { await action(); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível concluir."); }
  }
  const names = (user: AppUser) => user.role === "root" ? ["Todos os sistemas"] : user.systemIds.map(id => systems.find(system => system.id === id)?.name).filter((name): name is string => Boolean(name));
  return <>
    <header className="page-heading"><div><p className="eyebrow">PRIV HOST</p><h1>Usuários</h1><p>Somente o root cadastra usuários e define quais sistemas cada um administra.</p></div><button className="primary-action" onClick={() => setEditor({ user: null })}><Plus size={17} />Novo usuário</button></header>
    <section className="workspace-section" aria-label="Usuários cadastrados">
      <div className="list-toolbar"><div><h2>Usuários{!loading && <span className="count">{users.length}</span>}</h2><p>Cada usuário só enxerga os sistemas vinculados a ele.</p></div></div>
      {error && <div role="alert" className="error-message">{error}</div>}
      {loading ? <div className="empty-state">Carregando…</div> : <div className="dash-list">{users.map(user => <div key={user.id} className={"user-row" + (user.active ? "" : " inactive")}>
        <div><div className="dash-row-title"><UserRound size={15} /><strong>{user.username}</strong>{user.role === "root" && <span className="badge-root">root</span>}{!user.active && <span className="environment">desativado</span>}</div>
          <div className="user-systems">{names(user).length ? names(user).map(name => <span className="environment" key={name}>{name}</span>) : <span className="dash-row-url">Nenhum sistema vinculado</span>}</div></div>
        {user.role !== "root" && <div className="card-actions">
          <button className="icon-action" aria-label={"Editar " + user.username} onClick={() => setEditor({ user })}><Pencil size={16} /></button>
          <button className="icon-action" aria-label={(user.active ? "Desativar " : "Ativar ") + user.username} title={user.active ? "Desativar" : "Ativar"} onClick={() => run(() => api("PUT", { id: user.id, active: !user.active }))}><Power size={16} /></button>
          <button className="icon-action danger" aria-label={"Excluir " + user.username} onClick={() => setDeleting(user)}><Trash2 size={16} /></button>
        </div>}
      </div>)}</div>}
    </section>
    {editor && <UserEditor initial={editor.user} systems={systems} onClose={() => setEditor(null)} onSaved={async () => { setEditor(null); await load(); }} />}
    {deleting && <dialog className="system-dialog delete-dialog" ref={element => { if (element && !element.open) element.showModal(); }} onCancel={event => { event.preventDefault(); setDeleting(null); }}>
      <h2>Excluir usuário?</h2><p>O usuário <strong>{deleting.username}</strong> perderá o acesso. Os sistemas não são afetados.</p>
      <div className="dialog-footer"><button autoFocus className="secondary-action" onClick={() => setDeleting(null)}>Cancelar</button><button className="primary-action delete-action" onClick={() => { const target = deleting; setDeleting(null); void run(() => api("DELETE", { id: target.id })); }}>Excluir usuário</button></div>
    </dialog>}
  </>;
}
