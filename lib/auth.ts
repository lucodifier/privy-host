import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";
import type { Role } from "./users";

export const COOKIE_NAME = "priv_host_session";
const SESSION_MS = 12 * 60 * 60 * 1000;

export type SessionUser = { id: string; username: string; role: Role; mustChangePassword: boolean; systemIds: string[] };

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

export function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  db().prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
  db().prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(sha256(token), userId, Date.now() + SESSION_MS);
  return token;
}

export function destroySession(token: string) {
  db().prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
}

export function destroyUserSessions(userId: string) {
  db().prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
}

export async function setSessionCookie(token: string, request: Request) {
  const secure = request.headers.get("x-forwarded-proto") === "https" || new URL(request.url).protocol === "https:";
  (await cookies()).set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: SESSION_MS / 1000 });
}

export async function clearSessionCookie() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function currentToken() {
  return (await cookies()).get(COOKIE_NAME)?.value;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await currentToken();
  if (!token) return null;
  const row = db().prepare(
    `SELECT u.id, u.username, u.role, u.must_change_password FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ? AND u.active = 1`,
  ).get(sha256(token), Date.now()) as { id: string; username: string; role: Role; must_change_password: number } | undefined;
  if (!row) return null;
  const systemIds = (db().prepare("SELECT system_id FROM memberships WHERE user_id = ?").all(row.id) as { system_id: string }[]).map(item => item.system_id);
  return { id: row.id, username: row.username, role: row.role, mustChangePassword: Boolean(row.must_change_password), systemIds };
}

// Limite simples de tentativas de login (por usuário + IP), em memória.
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 5 * 60 * 1000;
export function loginLocked(key: string) {
  const entry = attempts.get(key);
  return Boolean(entry && entry.until > Date.now());
}
export function registerLoginFailure(key: string) {
  const entry = attempts.get(key);
  const count = entry && (entry.until === 0 || entry.until > Date.now()) ? entry.count + 1 : 1;
  attempts.set(key, { count, until: count >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0 });
}
export function registerLoginSuccess(key: string) {
  attempts.delete(key);
}
