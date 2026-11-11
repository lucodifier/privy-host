# Priv Host

Cofre self-hosted para guardar sistemas (nome, URL, ambiente) e seus logins e senhas.
Dashboard com resumo e acesso rápido; clicar em **Abrir** abre o sistema em uma nova aba.
Dados em SQLite, cada registro criptografado com AES-256-GCM.

> **Sem autenticação própria.** Rode apenas na sua máquina ou em rede privada protegida.
> Por padrão o Docker publica só em `127.0.0.1`.

## Rodar com Docker (recomendado)

Requisito: Docker com Docker Compose.

```bash
git clone <URL-DO-REPOSITORIO> priv-host
cd priv-host
docker compose up -d --build
```

Abra http://localhost:3000

- Dashboard: `/`
- Cadastro de sistemas e acessos: `/systems`

Na primeira execução a chave de criptografia é gerada automaticamente e guardada no volume de dados
(`data/.encryption-key`, dentro do container).

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

Para definir a chave você mesmo, gere 32 bytes em base64 e informe no `docker-compose.yml`:

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

## Desenvolvimento (sem Docker)

Requer Node.js 24 ou superior.

```bash
cp .env.example .env   # preencha PRIV_HOST_ENCRYPTION_KEY
npm install
npm run dev
```

Produção local: `npm run build && npm start`.
