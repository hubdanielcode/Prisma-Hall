import { z } from "zod";

const signInSchema = z.object({
  // 1. Email

  typedEmail: z.email("Digite um e-mail válido."),

  // 2. Senha

  typedPassword: z.string().min(1, "Digite sua senha."),
});

export { signInSchema };
