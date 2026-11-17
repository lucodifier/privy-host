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
| 🛡️ **Criptografia em repouso** | Cada registro é cifrado com AES-256-GCM antes de ir ao SQLite. |
| 🐳 **Docker pronto** | Um `docker compose up` e está no ar, com volume persistente. |

## 🚀 Início rápido (Docker)

Requisito: Docker com Docker Compose.

```bash
git clone https://github.com/lucodifier/privy-host.git
cd privy-host
docker compose up -d --build
```

Abra **http://localhost:3000**

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

### Acessar de outra máquina da rede

Troque `127.0.0.1:3000:3000` por `3000:3000` em `docker-compose.yml`.
Como não há login, só faça isso em rede confiável.

## 🛠️ Desenvolvimento (sem Docker)

Requer **Node.js 24+** (usa o `node:sqlite` nativo).

```bash
cp .env.example .env   # preencha PRIV_HOST_ENCRYPTION_KEY
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

> ⚠️ **Sem autenticação própria.** Rode apenas na sua máquina ou em rede privada protegida (VPN, Tailscale, firewall). Não exponha na internet.

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
