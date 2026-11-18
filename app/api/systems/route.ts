import { linkSystem, createSystem, deleteSystem, getSystem, listSystems, updateSystem } from "@/lib/system-store";
import { systemSchema } from "@/lib/systems";
import { authorize, json, readBody } from "@/lib/guard";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await authorize(request);
  if (user instanceof Response) return user;
  try { return json(listSystems(user.role === "root" ? null : user.systemIds)); }
  catch { return json({ error: "Não foi possível carregar os sistemas. Verifique o banco e a chave de criptografia no servidor." }, 500); }
}

async function mutate(request: Request, method: "POST" | "PUT" | "DELETE") {
  // Cadastrar: qualquer usuário (fica vinculado a ele). Excluir: somente root. Editar: root (tudo) ou admin do sistema (apenas acessos).
  const user = await authorize(request, { mutate: true, root: method === "DELETE" });
  if (user instanceof Response) return user;
  const body = await readBody(request);
  if (!body) return json({ error: "Dados inválidos." }, 400);
  if (method !== "POST" && (typeof body.id !== "string" || !body.id)) return json({ error: "Sistema inválido." }, 400);
  try {
    if (method === "DELETE") return deleteSystem(body.id as string) ? json({ ok: true }) : json({ error: "Sistema não encontrado." }, 404);
    if (method === "POST") {
      const parsed = systemSchema.safeParse(body);
      if (!parsed.success) return json({ error: parsed.error.issues[0].message }, 400);
      const created = createSystem(parsed.data);
      if (user.role !== "root") linkSystem(user.id, created.id);
      return json(created, 201);
    }
    const id = body.id as string;
    // Sem vínculo, o sistema "não existe" para o usuário (não vaza a existência de outros sistemas).
    if (user.role !== "root" && !user.systemIds.includes(id)) return json({ error: "Sistema não encontrado." }, 404);
    const current = getSystem(id);
    if (!current) return json({ error: "Sistema não encontrado." }, 404);
    const candidate = user.role === "root" ? body : { name: current.name, url: current.url, environment: current.environment, accesses: body.accesses };
    const parsed = systemSchema.safeParse(candidate);
    if (!parsed.success) return json({ error: parsed.error.issues[0].message }, 400);
    return json(updateSystem(id, parsed.data));
  } catch { return json({ error: "Não foi possível salvar. Verifique o banco e a chave de criptografia no servidor." }, 500); }
}
export const POST = (request: Request) => mutate(request, "POST");
export const PUT = (request: Request) => mutate(request, "PUT");
export const DELETE = (request: Request) => mutate(request, "DELETE");
