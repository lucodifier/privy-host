import { clearSessionCookie, currentToken, destroySession } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/guard";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Origem não permitida." }, 403);
  const token = await currentToken();
  if (token) destroySession(token);
  await clearSessionCookie();
  return json({ ok: true });
}
