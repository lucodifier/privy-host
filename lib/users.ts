import { z } from "zod";

export const usernameSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9._-]{3,40}$/, "Usuário: 3 a 40 caracteres (letras, números, ponto, hífen ou sublinhado).");
export const passwordSchema = z.string().min(10, "A senha precisa ter ao menos 10 caracteres.").max(200, "Senha muito longa.");

export const newUserSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  systemIds: z.array(z.string().min(1)).max(500).default([]),
});
export const updateUserSchema = z.object({
  id: z.string().min(1),
  password: passwordSchema.optional(),
  active: z.boolean().optional(),
  systemIds: z.array(z.string().min(1)).max(500).optional(),
});

export type Role = "root" | "user";
export type AppUser = { id: string; username: string; role: Role; active: boolean; systemIds: string[] };
