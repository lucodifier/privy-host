import { createUser, deleteUser, listUsers, updateUser } from "@/lib/user-store";
import { newUserSchema, updateUserSchema } from "@/lib/users";
import { authorize, json, readBody } from "@/lib/guard";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Somente o root gerencia usuários e seus vínculos com sistemas.
export async function GET(request: Request) {
  const user = await authorize(request, { root: true });
  if (user instanceof Response) return user;
  return json(listUsers());
}

async function mutate(request: Request, method: "POST" | "PUT" | "DELETE") {
  const user = await authorize(request, { mutate: true, root: true });
  if (user instanceof Response) return user;
  const body = await readBody(request);
  if (!body) return json({ error: "Dados inválidos." }, 400);
  try {
    if (method === "DELETE") {
      return typeof body.id === "string" && deleteUser(body.id) ? json({ ok: true }) : json({ error: "Usuário não encontrado." }, 404);
    }
    if (method === "POST") {
      const parsed = newUserSchema.safeParse(body);
      if (!parsed.success) return json({ error: parsed.error.issues[0].message }, 400);
      const created = createUser(parsed.data);
      return created === "exists" ? json({ error: "Já existe um usuário com esse nome." }, 409) : json(created, 201);
    }
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) return json({ error: parsed.error.issues[0].message }, 400);
    const updated = updateUser(parsed.data);
    return updated ? json(updated) : json({ error: "Usuário não encontrado." }, 404);
  } catch { return json({ error: "Não foi possível salvar o usuário." }, 500); }
}
export const POST = (request: Request) => mutate(request, "POST");
export const PUT = (request: Request) => mutate(request, "PUT");
export const DELETE = (request: Request) => mutate(request, "DELETE");
