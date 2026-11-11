#!/bin/sh
set -e
# Sem chave no ambiente: gera uma na primeira execução e guarda no volume de dados.
if [ -z "$PRIV_HOST_ENCRYPTION_KEY" ]; then
  KEY_FILE=/app/data/.encryption-key
  if [ ! -f "$KEY_FILE" ]; then
    node -e "process.stdout.write(require('crypto').randomBytes(32).toString('base64'))" > "$KEY_FILE"
    chmod 600 "$KEY_FILE"
    echo "Chave de criptografia gerada em data/.encryption-key. Faça backup junto com o banco."
  fi
  PRIV_HOST_ENCRYPTION_KEY=$(cat "$KEY_FILE")
  export PRIV_HOST_ENCRYPTION_KEY
fi
exec "$@"
