import { createSystem, deleteSystem, listSystems, updateSystem } from "@/lib/system-store";
import { systemSchema } from "@/lib/systems";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
}
export function GET() {
  try { return json(listSystems()); }
  catch { return json({ error: "Não foi possível carregar os sistemas. Verifique o banco e a chave de criptografia no servidor." }, 500); }
}
async function mutate(request: Request, method: "POST" | "PUT" | "DELETE") {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  let originHost: string | null = null;
  try { originHost = origin ? new URL(origin).host : null; } catch { return json({ error: "Origem não permitida." }, 403); }
  if (originHost && originHost !== host) return json({ error: "Origem não permitida." }, 403);
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Dados inválidos." }, 400); }
  if (!body || typeof body !== "object") return json({ error: "Dados inválidos." }, 400);
  if (method !== "POST" && (typeof body.id !== "string" || !body.id)) return json({ error: "Sistema inválido." }, 400);
  try {
    if (method === "DELETE") return deleteSystem(body.id) ? json({ ok: true }) : json({ error: "Sistema não encontrado." }, 404);
    const parsed = systemSchema.safeParse(body);
    if (!parsed.success) return json({ error: parsed.error.issues[0].message }, 400);
    if (method === "POST") return json(createSystem(parsed.data), 201);
    const result = updateSystem(body.id, parsed.data);
    return result ? json(result) : json({ error: "Sistema não encontrado." }, 404);
  } catch { return json({ error: "Não foi possível salvar. Verifique o banco e a chave de criptografia no servidor." }, 500); }
}
export const POST = (request: Request) => mutate(request, "POST");
export const PUT = (request: Request) => mutate(request, "PUT");
export const DELETE = (request: Request) => mutate(request, "DELETE");
