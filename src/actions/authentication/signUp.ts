"use server";

import { after } from "next/server";
import { checkRateLimit, hash, sendValidationEmail } from "@/lib/server";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { signUpSchema } from "@/lib/validations/authentication/signUpSchema";
import z from "zod";

const signUp = async (user: z.infer<typeof signUpSchema>) => {
  const parsedSignUpUser = signUpSchema.safeParse(user);

  if (!parsedSignUpUser.success) {
    return false;
  }

  const rateLimit = await checkRateLimit({ action: "signUp", limit: 5, windowSeconds: 60 * 60 });

  if (!rateLimit.allowed) {
    return "too_many_attempts";
  }

  const validPassword = parsedSignUpUser.data.password;

  try {
    const hashedUserPassword = await hash(validPassword, 10);

    /* - Criando o usuário. Não existe sessão nem cookie aqui: o usuário só consegue entrar depois de validar o e-mail - */

    const newUser = await prisma.user.create({
      data: {
        name: parsedSignUpUser.data.name,
        email: parsedSignUpUser.data.email,
        password: hashedUserPassword,
      },
    });

    /* - O e-mail do cadastro conta como o primeiro envio nos limites do reenvio (intervalo de 60 segundos e máximo de 4 por hora) - */

    await checkRateLimit({ action: "validation-cooldown", identifier: newUser.email, limit: 1, windowSeconds: 60, includeIp: false });
    await checkRateLimit({ action: "validation-request", identifier: newUser.email, limit: 4, windowSeconds: 60 * 60, includeIp: false });

    /* - Envia o link de validação depois da resposta. Se falhar, o usuário pede outro pelo botão de reenvio - */

    after(async () => {
      try {
        await sendValidationEmail({ userId: newUser.id, name: newUser.name, email: newUser.email });
      } catch (error) {
        // O cadastro continua válido mesmo sem o e-mail. O erro só vai para o log do servidor, nunca para o usuário
        console.error("[validation-email] signUp:", error);
      }
    });

    return true;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      const errorMeta = JSON.stringify(error.meta);
      if (errorMeta.includes("email")) {
        return "email_is_not_unique";
      }
    }
    return false;
  }
};

export { signUp };
