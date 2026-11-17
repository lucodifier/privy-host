import { randomUUID } from "node:crypto";
import { db } from "./db";
import { hashPassword } from "./password";
import type { AppUser, Role } from "./users";

type Row = { id: string; username: string; role: Role; active: number };

function memberships() {
  const map = new Map<string, string[]>();
  for (const row of db().prepare("SELECT user_id, system_id FROM memberships").all() as { user_id: string; system_id: string }[]) {
    map.set(row.user_id, [...(map.get(row.user_id) ?? []), row.system_id]);
  }
  return map;
}
const toUser = (row: Row, systemIds: string[]): AppUser => ({ id: row.id, username: row.username, role: row.role, active: Boolean(row.active), systemIds });

export function listUsers(): AppUser[] {
  const map = memberships();
  const rows = db().prepare("SELECT id, username, role, active FROM users ORDER BY role = 'root' DESC, username").all() as Row[];
  return rows.map(row => toUser(row, map.get(row.id) ?? []));
}

function setMemberships(userId: string, systemIds: string[]) {
  const valid = systemIds.filter(id => db().prepare("SELECT 1 FROM systems WHERE id = ?").get(id));
  db().prepare("DELETE FROM memberships WHERE user_id = ?").run(userId);
  const insert = db().prepare("INSERT OR IGNORE INTO memberships (user_id, system_id) VALUES (?, ?)");
  for (const id of new Set(valid)) insert.run(userId, id);
}

function transaction<T>(work: () => T): T {
  db().exec("BEGIN");
  try { const result = work(); db().exec("COMMIT"); return result; }
  catch (error) { db().exec("ROLLBACK"); throw error; }
}

export function createUser(input: { username: string; password: string; systemIds: string[] }): AppUser | "exists" {
  if (db().prepare("SELECT 1 FROM users WHERE username = ?").get(input.username)) return "exists";
  const id = randomUUID();
  transaction(() => {
    db().prepare("INSERT INTO users (id, username, password_hash, role, active, must_change_password, created_at) VALUES (?, ?, ?, 'user', 1, 1, ?)")
      .run(id, input.username, hashPassword(input.password), Date.now());
    setMemberships(id, input.systemIds);
  });
  return listUsers().find(user => user.id === id)!;
}

/** O root não é alterado por aqui (somente a própria senha, em /account). */
export function updateUser(input: { id: string; password?: string; active?: boolean; systemIds?: string[] }): AppUser | null {
  const row = db().prepare("SELECT id, username, role, active FROM users WHERE id = ? AND role = 'user'").get(input.id) as Row | undefined;
  if (!row) return null;
  transaction(() => {
    if (input.password) {
      db().prepare("UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?").run(hashPassword(input.password), input.id);
      db().prepare("DELETE FROM sessions WHERE user_id = ?").run(input.id);
    }
    if (input.active !== undefined) {
      db().prepare("UPDATE users SET active = ? WHERE id = ?").run(input.active ? 1 : 0, input.id);
      if (!input.active) db().prepare("DELETE FROM sessions WHERE user_id = ?").run(input.id);
    }
    if (input.systemIds) setMemberships(input.id, input.systemIds);
  });
  return listUsers().find(user => user.id === input.id) ?? null;
}

export function deleteUser(id: string) {
  return db().prepare("DELETE FROM users WHERE id = ? AND role = 'user'").run(id).changes > 0;
}
