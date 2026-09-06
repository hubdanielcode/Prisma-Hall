import { z } from "zod";

const signInSchema = z.object({
  // 1. Email

  email: z.email("Digite um e-mail válido."),

  // 2. Senha

  password: z.string().min(1, "Digite sua senha."),
});

export { signInSchema };
