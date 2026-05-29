import { z } from "zod";

export const registroSchema = z.object({
  nome: z.string({ error: "Nome é obrigatório" }).min(1, "Nome é obrigatório"),
  email: z.string({ error: "E-mail é obrigatório" }).email("E-mail inválido"),
  senha: z
    .string({ error: "Senha é obrigatória" })
    .min(4, "A senha deve ter no mínimo 4 caracteres"),
});

export const loginSchema = z.object({
  email: z.string({ error: "E-mail é obrigatório" }).email("E-mail inválido"),
  senha: z
    .string({ error: "Senha é obrigatória" })
    .min(1, "Senha é obrigatória"),
});

export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const solicitarResetSchema = z.object({
  email: z.string({ error: "E-mail é obrigatório" }).email("E-mail inválido"),
});

export const redefinirSenhaSchema = z.object({
  token: z.string({ error: "Token é obrigatório" }).min(1, "Token é obrigatório"),
  novaSenha: z
    .string({ error: "Nova senha é obrigatória" })
    .min(4, "A senha deve ter no mínimo 4 caracteres"),
});

export type SolicitarResetInput = z.infer<typeof solicitarResetSchema>;
export type RedefinirSenhaInput = z.infer<typeof redefinirSenhaSchema>;
