# Priv Host

Aplicação local com apenas duas telas:

- Dashboard: links dos sistemas, ambiente, descrição de cada acesso e botões para mostrar/copiar login e senha. Os links abrem em outra aba.
- Sistemas: Novo Sistema cadastra nome, URL e ambiente. Configurar acessos permite adicionar, editar e remover descrições, logins e senhas.

Os dados começam vazios e são persistidos em SQLite em data/priv-host.db. O arquivo não entra no Git. Cada registro é criptografado com AES-256-GCM.

Requer Node.js 24 ou superior. A chave PRIV_HOST_ENCRYPTION_KEY deve conter 32 bytes em base64. A chave PRIVAULT_ENCRYPTION_KEY do ambiente anterior também é aceita para manter a instalação local funcionando. Preserve a chave junto com o backup do banco; sem ela os registros não podem ser recuperados.

Execute npm install e npm run dev. Para produção local: npm run build e npm start.

Esta versão não possui autenticação própria e deve rodar localmente ou em uma rede privada protegida. Não foi publicada.

A estrutura antiga de projetos, favoritos, atividade e segredos foi retirada da interface e suas páginas foram removidas. O schema Prisma anterior não é usado pelo novo fluxo. Nenhum banco anterior foi alterado.

