// Executa na subida do servidor: abre o banco, aplica migrações pendentes (sem apagar nada)
// e cria o usuário root na primeira execução, para a senha inicial já aparecer nos logs.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { db } = await import("./lib/db");
    db();
  }
}
