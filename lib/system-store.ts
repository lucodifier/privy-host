import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from "node:crypto";
import { db } from "./db";
import { systemSchema, type System, type SystemInput } from "./systems";

function key() {
  const value = Buffer.from(process.env.PRIV_HOST_ENCRYPTION_KEY ?? process.env.PRIVAULT_ENCRYPTION_KEY ?? "", "base64");
  if (value.length !== 32) throw new Error("Configure PRIV_HOST_ENCRYPTION_KEY com uma chave base64 de 32 bytes.");
  return value;
}
function encrypt(input: SystemInput) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const content = Buffer.concat([cipher.update(JSON.stringify(input), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), content].map(value => value.toString("base64")).join(":");
}
function decrypt(row: { id: string; content: string }): System {
  const [iv, tag, content] = row.content.split(":").map(value => Buffer.from(value, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return { id: row.id, ...systemSchema.parse(JSON.parse(Buffer.concat([decipher.update(content), decipher.final()]).toString("utf8"))) };
}

/** `ids` = null lista todos (root); caso contrário, apenas os sistemas informados. */
export function listSystems(ids: string[] | null = null): System[] {
  const rows = db().prepare("SELECT id, content FROM systems ORDER BY rowid DESC").all() as { id: string; content: string }[];
  const allowed = ids && new Set(ids);
  return rows.filter(row => !allowed || allowed.has(row.id)).map(decrypt);
}
export function getSystem(id: string): System | null {
  const row = db().prepare("SELECT id, content FROM systems WHERE id = ?").get(id) as { id: string; content: string } | undefined;
  return row ? decrypt(row) : null;
}
export function systemExists(id: string) {
  return Boolean(db().prepare("SELECT 1 FROM systems WHERE id = ?").get(id));
}
export function createSystem(input: SystemInput) {
  const id = randomUUID();
  const parsed = systemSchema.parse(input);
  db().prepare("INSERT INTO systems (id, content) VALUES (?, ?)").run(id, encrypt(parsed));
  return { id, ...parsed };
}
export function updateSystem(id: string, input: SystemInput) {
  const parsed = systemSchema.parse(input);
  const result = db().prepare("UPDATE systems SET content = ? WHERE id = ?").run(encrypt(parsed), id);
  return result.changes ? { id, ...parsed } : null;
}
export function deleteSystem(id: string) {
  // memberships são removidas em cascata (foreign key).
  return db().prepare("DELETE FROM systems WHERE id = ?").run(id).changes > 0;
}
