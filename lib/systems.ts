import { z } from "zod";

export const accessSchema = z.object({
  id: z.string().min(1).max(100),
  description: z.string().trim().min(1, "Informe a descrição do acesso.").max(120),
  login: z.string().trim().min(1, "Informe o login.").max(300),
  password: z.string().min(1, "Informe a senha.").max(2000),
});
export const systemSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do sistema.").max(120),
  url: z.string().trim().url("Informe uma URL válida, incluindo https://.").refine(value => { try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; } }, "Use uma URL http ou https."),
  environment: z.string().trim().min(1, "Informe o ambiente.").max(80),
  accesses: z.array(accessSchema).max(100),
}).refine(value => new Set(value.accesses.map(access => access.id)).size === value.accesses.length, "Os acessos precisam ter identificadores únicos.");
export type SystemInput = z.infer<typeof systemSchema>;
export type System = SystemInput & { id: string };
export type Access = z.infer<typeof accessSchema>;

