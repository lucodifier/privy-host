import { DatabaseSync } from "node:sqlite";
import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import { hashPassword } from "./password";

// O banco fica fora da imagem/container: PRIV_HOST_DATA_DIR (padrão ./data).
// Nunca é recriado nem sobrescrito: as migrações só adicionam estruturas (IF NOT EXISTS).
export function dataDir() {
  return resolve(/* turbopackIgnore: true */ process.env.PRIV_HOST_DATA_DIR || join(/* turbopackIgnore: true */ process.cwd(), "data"));
}

const MIGRATIONS: string[] = [
  // v1: estrutura original (sistemas criptografados) + usuários, vínculos e sessões.
  `CREATE TABLE IF NOT EXISTS systems (id TEXT PRIMARY KEY, content TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS users (
     id TEXT PRIMARY KEY,
     username TEXT NOT NULL UNIQUE,
     password_hash TEXT NOT NULL,
     role TEXT NOT NULL CHECK (role IN ('root', 'user')),
     active INTEGER NOT NULL DEFAULT 1,
     must_change_password INTEGER NOT NULL DEFAULT 0,
     created_at INTEGER NOT NULL
   );
   CREATE TABLE IF NOT EXISTS memberships (
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     system_id TEXT NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
     PRIMARY KEY (user_id, system_id)
   );
   CREATE TABLE IF NOT EXISTS sessions (
     token_hash TEXT PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     expires_at INTEGER NOT NULL
   );`,
];

let database: DatabaseSync | undefined;

export function db() {
  if (!database) {
    const directory = dataDir();
    mkdirSync(directory, { recursive: true });
    const instance = new DatabaseSync(join(directory, "priv-host.db"));
    instance.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
    migrate(instance);
    ensureRoot(instance, directory);
    database = instance;
  }
  return database;
}

function migrate(instance: DatabaseSync) {
  const current = (instance.prepare("PRAGMA user_version").get() as { user_version: number }).user_version;
  for (let version = current; version < MIGRATIONS.length; version++) {
    instance.exec("BEGIN");
    try {
      instance.exec(MIGRATIONS[version]);
      instance.exec(`PRAGMA user_version = ${version + 1}`);
      instance.exec("COMMIT");
    } catch (error) {
      instance.exec("ROLLBACK");
      throw error;
    }
  }
}

// Cria o usuário root na primeira execução.
// Senha: PRIV_HOST_ROOT_PASSWORD, ou uma senha aleatória (log + data/root-initial-password.txt) com troca obrigatória.
function ensureRoot(instance: DatabaseSync, directory: string) {
  if (instance.prepare("SELECT 1 FROM users WHERE role = 'root'").get()) return;
  const username = (process.env.PRIV_HOST_ROOT_USER || "root").trim().toLowerCase();
  const fromEnv = process.env.PRIV_HOST_ROOT_PASSWORD;
  const password = fromEnv || randomBytes(15).toString("base64url");
  instance
    .prepare("INSERT INTO users (id, username, password_hash, role, active, must_change_password, created_at) VALUES (?, ?, ?, 'root', 1, ?, ?)")
    .run(randomUUID(), username, hashPassword(password), fromEnv ? 0 : 1, Date.now());
  if (!fromEnv) {
    const file = join(directory, "root-initial-password.txt");
    writeFileSync(file, `usuario: ${username}\nsenha: ${password}\n`, { mode: 0o600 });
    try { chmodSync(file, 0o600); } catch { /* sistemas sem chmod */ }
    console.log(`[priv-host] Usuário root criado. Usuário: ${username} | Senha inicial: ${password} (troca obrigatória no primeiro login; também em ${file})`);
  } else {
    console.log(`[priv-host] Usuário root criado a partir de PRIV_HOST_ROOT_PASSWORD (usuário: ${username}).`);
  }
}
