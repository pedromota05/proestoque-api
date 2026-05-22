import { z } from "zod";

export const registroSchema = z.object({
  nome: z.string({ error: "Nome é obrigatório" }).min(1, "Nome é obrigatório"),
  email: z.string({ error: "E-mail é obrigatório" }).email("E-mail inválido"),
  senha: z
    .string({ error: "Senha é obrigatória" })
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string({ error: "E-mail é obrigatório" }).email("E-mail inválido"),
  senha: z
    .string({ error: "Senha é obrigatória" })
    .min(1, "Senha é obrigatória"),
});

export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
