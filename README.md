<div align="center">

# 🔐 Priv Host

**Seus sistemas, ambientes e acessos em um só lugar — self-hosted, criptografado e sem nuvem.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![SQLite](https://img.shields.io/badge/SQLite-node%3Asqlite-003b57?logo=sqlite&logoColor=white)](https://nodejs.org/api/sqlite.html)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ed?logo=docker&logoColor=white)](https://www.docker.com)
[![AES-256-GCM](https://img.shields.io/badge/cripto-AES--256--GCM-success)](#-segurança)

[Landing page](https://lucodifier.github.io/privy-host/) · [Rodar com Docker](#-início-rápido-docker) · [Segurança](#-segurança)

</div>

---

## ✨ O que é

O **Priv Host** é um cofre pessoal para quem acumula dezenas de sistemas (produção, homologação, painéis de clientes…) e cansou de procurar login e senha em planilhas e notas soltas.

Você cadastra cada sistema com **nome, URL e ambiente**, anexa quantos **acessos** quiser (descrição, login e senha) e usa um dashboard para abrir qualquer um com um clique.

Tudo roda na sua máquina. Nenhum dado sai dela.

## 🧩 Funcionalidades

| | |
|---|---|
| 📊 **Dashboard** | Visão geral dos sistemas, ambientes e acesso rápido. **Abrir** leva ao sistema em uma nova aba. |
| 🗂️ **Cadastro de sistemas** | Nome, URL e ambiente, com validação (somente `http`/`https`). |
| 🔑 **Múltiplos acessos por sistema** | Descrição, login e senha; edite e remova quando quiser. |
| 👁️ **Mostrar / copiar** | Credenciais ocultas por padrão, reveladas ou copiadas sob demanda. |
| 🔎 **Busca** | Encontre sistemas por nome ou ambiente. |
| 👥 **Usuários e permissões por sistema** | Usuário `root` cadastra sistemas e usuários; cada usuário só vê e edita os acessos dos sistemas vinculados a ele. |
| 🛡️ **Criptografia em repouso** | Cada registro é cifrado com AES-256-GCM antes de ir ao SQLite. |
| 🐳 **Docker pronto** | Um `docker compose up` e está no ar, com volume persistente. |

## 🚀 Início rápido (Docker)

Requisito: Docker com Docker Compose.

```bash
git clone https://github.com/lucodifier/privy-host.git
cd privy-host
docker compose up -d --build
```

Abra **http://localhost:3000** e entre com o usuário `root` (veja [Primeiro acesso](#-usuários-e-permissões)).

> Quer outra porta (a 3000 do servidor pode estar ocupada)? Copie `.env.example` para `.env` e defina `PRIV_HOST_PORT=8085`. Veja [Porta e rede](#porta-e-rede).

| Rota | O que faz |
|---|---|
| `/` | Dashboard |
| `/systems` | Cadastro de sistemas e acessos |

Na primeira execução a chave de criptografia é gerada automaticamente e guardada no volume de dados (`data/.encryption-key`, dentro do container).

### Comandos úteis

```bash
docker compose logs -f        # ver logs
docker compose down           # parar (os dados são mantidos)
docker compose down -v        # parar e APAGAR banco e chave
docker compose up -d --build  # atualizar após git pull
```

### Backup

Faça backup do banco **e** da chave. Sem a chave os registros não podem ser recuperados.

```bash
docker compose cp priv-host:/app/data ./backup-priv-host
```

### Chave própria (opcional)

Gere 32 bytes em base64 e informe no `docker-compose.yml`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

```yaml
services:
  priv-host:
    environment:
      PRIV_HOST_ENCRYPTION_KEY: "<chave>"
```

### Porta e rede

Tudo é configurado no `.env` (copie de `.env.example`), sem editar o `docker-compose.yml`:

| Variável | Padrão | Para quê |
|---|---|---|
| `PRIV_HOST_PORT` | `3000` | Porta publicada no servidor (dentro do container é sempre 3000). |
| `PRIV_HOST_BIND` | `127.0.0.1` | `0.0.0.0` para acessar de outras máquinas. Prefira um proxy HTTPS na frente. |

```bash
# exemplo: servidor com a 3000 ocupada, acessível pela rede
echo "PRIV_HOST_PORT=8085" >> .env
echo "PRIV_HOST_BIND=0.0.0.0" >> .env
docker compose up -d --build   # http://SERVIDOR:8085
```

### Atualizar sem perder dados

O banco SQLite (`priv-host.db`) e a chave ficam no volume Docker **`priv-host-data`**, fora da imagem. O volume tem nome fixo, então não muda se você clonar o repositório em outra pasta.

```bash
git pull
docker compose up -d --build   # recria só o container; o volume é mantido
```

- O container **nunca** recria nem sobrescreve o banco. Novas versões aplicam migrações que apenas **adicionam** tabelas/colunas (controladas por `PRAGMA user_version`).
- **Não use** `docker compose down -v` (apaga o volume).
- Se você já rodava uma versão anterior com o volume antigo (`<pasta>_priv-host-data`), copie os dados uma vez:
  ```bash
  docker volume ls | grep priv-host            # confirme o nome do volume antigo
  docker run --rm -v <volume-antigo>:/from -v priv-host-data:/to alpine sh -c "cp -a /from/. /to/"
  ```

## 🛠️ Desenvolvimento (sem Docker)

Requer **Node.js 24+** (usa o `node:sqlite` nativo).

```bash
cp .env.example .env   # preencha PRIV_HOST_ENCRYPTION_KEY (e, se quiser, PRIV_HOST_ROOT_PASSWORD)
npm install
npm run dev            # http://localhost:3000
```

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`) |
| `npm run build` | Build de produção |
| `npm start` | Serve o build de produção |

## 🔒 Segurança

- **Criptografia em repouso:** cada sistema (incluindo logins e senhas) é serializado e cifrado com **AES-256-GCM**, com IV aleatório de 12 bytes e tag de autenticação por registro.
- **Chave fora do banco:** vem de `PRIV_HOST_ENCRYPTION_KEY` ou é gerada no primeiro start e guardada à parte (`data/.encryption-key`). Ambos ficam fora do Git.
- **Proteção contra CSRF:** a API rejeita mutações cuja `Origin` difere do host.
- **Sem cache:** respostas da API usam `Cache-Control: no-store`.
- **Bind local por padrão:** o Docker publica apenas em `127.0.0.1`.

- **Login com sessão:** senhas com scrypt, cookie `HttpOnly` + `SameSite=Lax` (e `Secure` atrás de HTTPS), sessão de 12 h, bloqueio de 5 min após 5 tentativas erradas.
- **Permissão no servidor:** todas as rotas da API validam o usuário; a interface apenas reflete essas regras.

> ⚠️ Mesmo com login, o serviço guarda senhas. Prefira rede privada (VPN, Tailscale, firewall) ou um proxy HTTPS; evite expor direto na internet. Sem HTTPS, o tráfego de login não é criptografado.

## 👥 Usuários e permissões

| Quem | Pode |
|---|---|
| **root** | Cadastrar/editar/excluir **sistemas**; cadastrar/editar/desativar/excluir **usuários**; vincular usuários a sistemas; ver tudo. |
| **Usuário (admin de sistema)** | Ver e editar os **acessos** (descrição, login, senha) **somente dos sistemas vinculados a ele**. Não vê outros sistemas, não altera nome/URL/ambiente, não cadastra sistemas nem usuários. |

Um usuário pode estar vinculado a mais de um sistema. Quem tenta acessar um sistema sem vínculo recebe "não encontrado".

### Primeiro acesso

Na primeira execução (banco sem root) o usuário `root` é criado:

- com a senha de `PRIV_HOST_ROOT_PASSWORD`, se definida no `.env`; ou
- com uma **senha aleatória**, mostrada nos logs (`docker compose logs priv-host`) e gravada em `data/root-initial-password.txt` no volume. O sistema exige a troca no primeiro login.

Usuários criados pelo root também entram com a senha inicial definida por ele e precisam trocá-la no primeiro login. Se o root esquecer a senha, apague o usuário root direto no banco (ou restaure o backup) e reinicie para gerar outro; os sistemas e acessos não são afetados.

## 🏗️ Arquitetura

```
app/
├─ (app)/              Dashboard (/) e Sistemas (/systems)
└─ api/systems/        API REST: GET · POST · PUT · DELETE
components/            Dashboard, workspace de sistemas e UI base
lib/
├─ systems.ts          Schemas Zod e tipos
└─ system-store.ts     SQLite + AES-256-GCM
```

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Zod · SQLite (`node:sqlite`) · Docker.

## 📄 Licença

Projeto pessoal de [@lucodifier](https://github.com/lucodifier). Defina a licença do repositório conforme o uso que pretende permitir.
