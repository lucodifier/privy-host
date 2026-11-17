import { db } from "@/lib/db";
import { DUMMY_HASH, verifyPassword } from "@/lib/password";
import { createSession, loginLocked, registerLoginFailure, registerLoginSuccess, setSessionCookie } from "@/lib/auth";
import { json, readBody, sameOrigin } from "@/lib/guard";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Origem não permitida." }, 403);
  const body = await readBody(request);
  const username = typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!username || !password || password.length > 200) return json({ error: "Informe usuário e senha." }, 400);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const lockKey = `${username}|${ip}`;
  if (loginLocked(lockKey)) return json({ error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." }, 429);
  const row = db().prepare("SELECT id, password_hash, must_change_password FROM users WHERE username = ? AND active = 1").get(username) as
    { id: string; password_hash: string; must_change_password: number } | undefined;
  const valid = verifyPassword(password, row?.password_hash ?? DUMMY_HASH) && Boolean(row);
  if (!row || !valid) { registerLoginFailure(lockKey); return json({ error: "Usuário ou senha inválidos." }, 401); }
  registerLoginSuccess(lockKey);
  await setSessionCookie(createSession(row.id), request);
  return json({ ok: true, mustChangePassword: Boolean(row.must_change_password) });
}
