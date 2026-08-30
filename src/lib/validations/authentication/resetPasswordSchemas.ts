import { z } from "zod";

const resetPasswordRequestSchema = z
  .email()
  .max(50, "Seu e-mail não deve ultrapassar um máximo de 50 caracteres.");

const resetPasswordSchema = z
  .object({
    // 1. Token

    token: z.uuid(),

    // 2. Senha

    password: z
      .string()
      .min(6, "Sua senha deve conter um mínimo de 6 caracteres.")
      .max(30, "Sua senha não deve ultrapassar um máximo de 30 caracteres."),

    // 3. Confirmação de senha

    confirmPassword: z
      .string()
      .min(6, "Sua senha deve conter um mínimo de 6 caracteres.")
      .max(30, "Sua senha não deve ultrapassar um máximo de 30 caracteres."),
  })
  .refine(
    ({ password, confirmPassword }) => {
      if (password === confirmPassword) {
        return true;
      } else {
        return false;
      }
    },
    { message: "As senhas não coincidem." },
  );

export { resetPasswordSchema, resetPasswordRequestSchema };
