"use client";
import { PasswordInput } from "@/components/password-input";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Lock } from "lucide-react";

async function post(url: string, body: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Não foi possível concluir.");
  return data;
}

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const data = await post("/api/auth/login", { username, password });
      window.location.href = data.mustChangePassword ? "/account" : "/";
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha no login."); setBusy(false); }
  }
  return <form className="auth-card editor-fields" onSubmit={submit}>
    <span className="auth-icon"><Lock size={22} /></span>
    <h1>Entrar no Priv Host</h1>
    <p>Use o usuário que o administrador criou para você.</p>
    <label>Usuário<input autoFocus required autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} /></label>
    <label>Senha<PasswordInput required autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} /></label>
    {error && <p role="alert" className="error-message">{error}</p>}
    <button className="primary-action" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</button>
  </form>;
}

export function PasswordForm({ forced }: { forced: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (next !== confirm) { setError("A confirmação não confere com a nova senha."); return; }
    setBusy(true); setError("");
    try { await post("/api/auth/password", { current, next }); window.location.href = "/"; }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Falha ao trocar a senha."); setBusy(false); }
  }
  return <form className="auth-card editor-fields" onSubmit={submit}>
    <span className="auth-icon"><Lock size={22} /></span>
    <h1>{forced ? "Defina sua senha" : "Alterar senha"}</h1>
    <p>{forced ? "Por segurança, troque a senha inicial antes de continuar." : "A nova senha encerra as outras sessões abertas."}</p>
    <label>Senha atual<PasswordInput required autoComplete="current-password" value={current} onChange={event => setCurrent(event.target.value)} /></label>
    <label>Nova senha (mín. 10 caracteres)<PasswordInput required minLength={10} autoComplete="new-password" value={next} onChange={event => setNext(event.target.value)} /></label>
    <label>Confirmar nova senha<PasswordInput required minLength={10} autoComplete="new-password" value={confirm} onChange={event => setConfirm(event.target.value)} /></label>
    {error && <p role="alert" className="error-message">{error}</p>}
    <button className="primary-action" disabled={busy}>{busy ? "Salvando…" : "Salvar senha"}</button>
    {!forced && <Link className="secondary-action" href="/">Cancelar</Link>}
  </form>;
}
