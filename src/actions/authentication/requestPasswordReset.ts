"use server";

import { getResend } from "@/lib/resend";
import { PasswordResetEmail } from "@/shared/emails/PasswordResetEmail";
import { prisma } from "@/lib/prisma";
import { requestPasswordResetSchema } from "@/lib/validations/authentication/passwordResetSchemas";
import React from "react";

const requestPasswordReset = async (email: string) => {
  const resend = getResend();

  const validEmail = requestPasswordResetSchema.safeParse(email);

  if (!validEmail.success) {
    return false;
  }

  const user = await prisma.user.findUnique({ where: { email: email } });

  /* - Independente do resultado, sempre retorna true e confirma o envio. A intenção é justamente evitar o vazamento de informações que confirmem que o email realmente existe no banco de dados - */

  if (!user) {
    return true;
  }

  try {
    const token = crypto.randomUUID();
    const tokenExpiresAt = new Date(Date.now() + 60 * 10 * 1000);

    await prisma.user.update({
      where: { email: email },
      data: {
        token: token,
        tokenExpiresAt: tokenExpiresAt,
      },
    });

    /* - Enviando o email de troca de senha para o endereço que o usuário digitou - */

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/recuperar-senha?token=${token}`;

    const emailSender = await resend.emails.send({
      from: "Prisma Hall <naoresponda@prismahall.com>",
      to: user.email,
      subject: "Redefina sua senha no Prisma Hall",
      text: `Recebemos uma solicitação para redefinir a sua senha. Acesse o link: ${resetLink}`,
      react: React.createElement(PasswordResetEmail, { resetLink }),
    });

    if (emailSender.error) {
      return false;
    }
  } catch (error) {
    return false;
  }

  return true;
};

export { requestPasswordReset };
