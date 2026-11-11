# PRIVault — notas de continuidade

> Atualizado em 2026-11-10, ao final da sessão. Estado real do código, sem declarar nada que ainda não existe.

## 0. Ponto exato de retomada

O backend foi **iniciado**, não concluído. Nesta sessão foram feitos: instalação das dependências, schema Prisma, migration inicial, `.env` com chave de criptografia, `next.config.ts` e geração do Prisma Client. **Nenhuma linha de `lib/` de backend, nenhuma API, nenhuma tela de login existe ainda.** A UI continua servida pelo mock `lib/data.ts` e não há banco criado (`data/` está vazio).

Amanhã, o primeiro arquivo a escrever é `lib/db.ts` (client Prisma + runner de migrations), seguido de `lib/crypto.ts`, `lib/password.ts`, `lib/auth.ts`, `lib/validation.ts` e `lib/services/*`.

## 1. O que está pronto

### Frontend (visual)
- Next.js 16 (App Router) + React 19 + TypeScript 7 + Tailwind CSS 4, tema escuro fixo (`data-theme="dark"`).
- Tokens em `app/globals.css` (`--canvas #17191F`, `--panel #20232B`, `--surface #272B35`, `--line #353A46`, `--brand #F97316`, `--brand-hover #EA580C`, `--brand-light #FB923C`, `--ink #E5E7EB`, `--muted #9298A5`, `--success #22C55E`, `--danger #EF4444`) expostos via `@theme inline`; tema claro futuro só sobrescreve variáveis.
- Shell: `components/shell/{app-shell,sidebar,topbar,logo}.tsx` — sidebar fixa + drawer mobile, topbar com busca, avatar, botão primário.
- Primitivos: `components/ui/{button,badge,field,table,page}.tsx`.
- Tabelas: `components/credentials-table.tsx` (client, ainda alimentada por mock) e `components/activity-table.tsx`.
- Páginas: `app/(app)/{page,projects,credentials,favorites,recent-access,settings}`. **Todas ainda usam `lib/data.ts` (mock)** — inclusive textos de "workspace", "ambientes", "credenciais" e "segredos", que precisam ser trocados por projetos/acessos.

### Backend (só fundação)
- Dependências instaladas:
  - `prisma@6.19.3` + `@prisma/client@6.19.3` (Prisma 6, sem driver adapter — SQLite nativo)
  - `zod@3.25.76`
  - `@node-rs/argon2@2.2.2` (Argon2id nativo, pré-compilado, sem toolchain no Windows)
  - `tsx@4.23.15` (dev, para rodar testes TypeScript com `node:test`)
- `prisma/schema.prisma`: `User`, `Session`, `Project`, `Credential`; relação `Project 1:N Credential` com `onDelete: Cascade`; índices em `projectId`, `isFavorite`, `lastAccessedAt`; `User.email` e `Project.name` únicos.
- `prisma/migrations/0001_init/migration.sql`: DDL completa + índices.
- `next.config.ts`: `serverExternalPackages: ["@prisma/client", "@node-rs/argon2"]`.
- `.env` criado localmente (ignorado pelo git) com:
  - `DATABASE_URL="file:../data/privault.db"` (relativo a `prisma/`, usado pela CLI)
  - `PRIVAULT_ENCRYPTION_KEY="<32 bytes em base64>"` já gerada
- `.env.example` criado com as mesmas chaves e valor vazio + comando para gerar a chave.
- `.gitignore` ignora `data/*.db`, journals/WAL e `.env`.
- Prisma Client **já gerado** em `node_modules/.prisma/client` (`npx prisma generate` executado com sucesso).
- `data/` existe, porém **vazio**: o banco ainda não foi criado.

## 2. Decisões de arquitetura já fixadas

- **Banco**: SQLite em `./data/privault.db`; caminho absoluto calculado em `lib/db.ts` a partir de `process.cwd()` e passado via `datasourceUrl` do Prisma (evita ambiguidade de caminho relativo entre CLI e runtime). `data/` é criado no boot.
- **Migrations em runtime**: runner próprio lê `prisma/migrations/*/migration.sql` em ordem, aplica com `prisma.$executeRawUnsafe` e registra o nome em `_privault_migrations` dentro de transação. Objetivo: `npm start` funciona sem depender da CLI. O `DATABASE_URL` do `.env` serve apenas para comandos de CLI.
- **Sessão**: token de 32 bytes no cookie `privault_session` (`HttpOnly`, `SameSite=Lax`, `Secure` quando a requisição é HTTPS), apenas o SHA-256 do token é gravado em `Session`, validade de 7 dias, logout apaga o registro e o cookie.
- **Senha do admin**: Argon2id via `@node-rs/argon2`, `memoryCost 19456`, `timeCost 2`, `parallelism 1`.
- **Senhas dos acessos**: AES-256-GCM com a chave de `PRIVAULT_ENCRYPTION_KEY`; formato `v1:<iv base64>:<tag base64>:<ciphertext base64>`; descriptografia só no servidor, por endpoint autenticado.
- **Usuário único**: sem cadastro público, sem convites, sem workspaces/papéis.
- **Produto**: projetos e acessos (nome, URL, login, senha, descrição, favorito, datas). Sem ambientes, sem tipos de secret, sem métricas fictícias.
- **Sem Docker** nesta fase: validar localmente primeiro.
- **Chave de criptografia é imutável** após existir dado gravado; perder a chave significa perder as senhas.

## 3. Ordem de implementação planejada

1. `lib/db.ts` — client singleton + `ensureDatabase()` (mkdir `data`, runner de migrations, cleanup de sessões expiradas).
2. `lib/crypto.ts` — `encryptSecret`, `decryptSecret`, validação da chave (32 bytes), erro claro se ausente.
3. `lib/password.ts` — `hashPassword`, `verifyPassword` (Argon2id).
4. `lib/auth.ts` — criar/validar/revogar sessão, `getCurrentUser`, `requireUser` (redirect), guard para API (401).
5. `lib/validation.ts` — schemas Zod (setup, login, conta, projeto, acesso; URL só `http/https`).
6. `lib/services/{account,projects,credentials,stats}.ts` — todo acesso ao banco; nunca expor `passwordEncrypted` em DTOs.
7. `app/api/*` — `setup`, `auth/login`, `auth/logout`, `account`, `projects` (+`[id]`), `credentials` (+`[id]`, `[id]/favorite`, `[id]/reveal`, `[id]/access`).
8. `app/setup/page.tsx` e `app/login/page.tsx` (cards centralizados); `app/(app)/layout.tsx` chama `requireUser` e passa o usuário real ao shell.
9. UI real: modais de projeto e acesso; tabela com revelar/copiar senha, copiar login, abrir URL (`noopener noreferrer`), favoritar, editar e excluir; estados vazios com botões funcionais.
10. Tradução: Painel, Projetos, Todos os acessos, Favoritos, Acessos recentes, Configurações; "Novo acesso".
11. Remover `lib/data.ts` e ajustar `activity-table.tsx`/`credentials-table.tsx`.
12. Testes (`tsx --test tests/*.test.ts`) + roteiro E2E HTTP com reinício do servidor; `npm run build` e `npm run start`.

## 4. Como rodar hoje

```bash
npm install
npm run dev     # http://localhost:3000
```

Continua abrindo o dashboard com dados fictícios, sem login e sem banco. `npm run build` ainda não foi reexecutado depois da instalação do Prisma/Argon2; a última execução bem-sucedida foi na versão somente-visual.

Observação: o npm 11 desta máquina bloqueia postinstall scripts (`allow-scripts`), mas `npx prisma generate` funcionou e `npx tsx` também. Se `prisma generate` for necessário de novo: `npx prisma generate`.

## 5. Configuração de ambiente

```env
DATABASE_URL="file:../data/privault.db"
PRIVAULT_ENCRYPTION_KEY="<32 bytes em base64>"
```

Gerar a chave: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Guarde fora do repositório e faça backup.

## 6. Verificações já feitas

- `npm run build` passou na versão somente-visual (8 rotas, sem erros de tipo).
- Rotas de produção responderam 200 quando o servidor foi levantado manualmente (porta 3311, já encerrada).
- Prisma Client gerado com sucesso nesta sessão.
- **Nada de backend foi executado**: nenhuma migração aplicada, nenhum usuário criado, nenhum teste rodado, nenhum CRUD validado.
