import { getCurrentUser, type SessionUser } from "./auth";

export function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try { return new URL(origin).host === host; } catch { return false; }
}

/**
 * Autentica a requisição. Retorna o usuário ou uma Response de erro pronta.
 * - mutate: exige mesma origem (proteção CSRF).
 * - root: exige o usuário root.
 * - allowPasswordChange: permite usuários com troca de senha pendente.
 */
export async function authorize(request: Request, options: { mutate?: boolean; root?: boolean; allowPasswordChange?: boolean } = {}): Promise<SessionUser | Response> {
  if (options.mutate && !sameOrigin(request)) return json({ error: "Origem não permitida." }, 403);
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sessão expirada. Entre novamente." }, 401);
  if (user.mustChangePassword && !options.allowPasswordChange) return json({ error: "Troque a senha inicial antes de continuar." }, 403);
  if (options.root && user.role !== "root") return json({ error: "Apenas o root pode fazer isso." }, 403);
  return user;
}

export async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? body : null;
  } catch { return null; }
}

export { sameOrigin };
