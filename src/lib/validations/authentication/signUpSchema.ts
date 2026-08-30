import { z } from "zod";
import { regex } from "@/shared";
import { prisma } from "@/lib/prisma";

/* - Definições - */

const allowedDomains = [
  "gmail.com",
  "hotmail.com",
  "hotmail.com.br",
  "outlook.com",
  "yahoo.com",
  "yahoo.com.br",
];

const signUpSchema = z
  .object({
    // 1. Nome

    name: z
      .string()
      .regex(regex.name, "Digite seu nome completo.")
      .min(2, "Seu nome deve conter um mínimo de 2 caracteres.")
      .max(50, "Seu nome não deve ultrapassar um máximo de 50 caracteres."),

    // 2. Email

    email: z
      .email()
      .max(50, "Seu e-mail não deve ultrapassar um máximo de 50 caracteres.")
      .refine(
        (email) => {
          const [local, domain] = email.split("@");
          if (local.length >= 2 && allowedDomains.includes(domain)) {
            return true;
          } else {
            return false;
          }
        },
        { message: "Use um e-mail do gmail, hotmail, outlook ou yahoo." },
      )
      .refine(
        async (email) => {
          const existingUser = await prisma.user.findUnique({ where: { email: email } });
          if (!existingUser) {
            return true;
          } else {
            return false;
          }
        },
        { message: "Este e-mail já está cadastrado no nosso banco de dados." },
      ),

    // 3. Senha

    password: z
      .string()
      .min(6, "Sua senha deve conter um mínimo de 6 caracteres.")
      .max(30, "Sua senha não deve ultrapassar um máximo de 30 caracteres."),

    // 4. Confirmação de Senha

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

export { signUpSchema };
