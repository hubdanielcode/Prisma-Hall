import { z } from "zod";

const newsletterSchema = z.object({
  // 1. Email

  email: z.email("Digite um e-mail válido.").max(50, "Seu e-mail não deve ultrapassar um máximo de 50 caracteres."),
});

export { newsletterSchema };
