import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroyUserSessions, setSessionCookie } from "@/lib/auth";
import { authorize, json, readBody } from "@/lib/guard";
import { passwordSchema } from "@/lib/users";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Troca a própria senha (inclui a troca obrigatória do primeiro acesso).
export async function POST(request: Request) {
  const user = await authorize(request, { mutate: true, allowPasswordChange: true });
  if (user instanceof Response) return user;
  const body = await readBody(request);
  const current = typeof body?.current === "string" ? body.current : "";
  const next = passwordSchema.safeParse(body?.next);
  if (!next.success) return json({ error: next.error.issues[0].message }, 400);
  const row = db().prepare("SELECT password_hash FROM users WHERE id = ?").get(user.id) as { password_hash: string } | undefined;
  if (!row || !verifyPassword(current, row.password_hash)) return json({ error: "Senha atual incorreta." }, 400);
  if (current === next.data) return json({ error: "A nova senha precisa ser diferente da atual." }, 400);
  db().prepare("UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?").run(hashPassword(next.data), user.id);
  destroyUserSessions(user.id);
  await setSessionCookie(createSession(user.id), request);
  return json({ ok: true });
}
