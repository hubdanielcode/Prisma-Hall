"use server";

import { after } from "next/server";
import { checkRateLimit } from "@/lib/server/rate-limit/rateLimiter";
import { getResend } from "@/lib/server/services/resend";
import { PasswordResetEmail } from "@/shared/emails/PasswordResetEmail";
import { prisma } from "@/lib/server/services/prisma";
import { requestPasswordResetSchema } from "@/lib/validations/authentication/passwordResetSchemas";
import React from "react";

const requestPasswordReset = async (email: string) => {
  const validEmail = requestPasswordResetSchema.safeParse(email);

  /* - Formato inválido não revela nada sobre o banco, porque depende só do texto digitado - */

  if (!validEmail.success) {
    return false;
  }

  /* - O limite vale para qualquer e-mail, exista ou não, então não revela nada sobre o banco - */

  const emailRateLimit = await checkRateLimit({ action: "pwd-request", identifier: validEmail.data, limit: 3, windowSeconds: 60 * 60 });
  const ipRateLimit = await checkRateLimit({ action: "pwd-request-ip", limit: 10, windowSeconds: 60 * 60 });

  if (!emailRateLimit.allowed || !ipRateLimit.allowed) {
    return "too_many_attempts";
  }

  const user = await prisma.user.findUnique({ where: { email: validEmail.data } });

  /* - Daqui em diante a resposta é sempre true, exista o e-mail ou não. O trabalho de verdade (token + envio) roda depois da resposta, para que nem o resultado nem o tempo de resposta entreguem se o e-mail existe - */

  if (user) {
    after(async () => {
      try {
        const token = crypto.randomUUID();
        const tokenExpiresAt = new Date(Date.now() + 60 * 10 * 1000);

        await prisma.user.update({
          where: { id: user.id },
          data: { token, tokenExpiresAt },
        });

        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/recuperar-senha?token=${token}`;

        await getResend().emails.send({
          from: "Prisma Hall <naoresponda@prismahall.com>",
          to: user.email,
          subject: "Redefina sua senha no Prisma Hall",
          text: `Recebemos uma solicitação para redefinir a sua senha. Acesse o link: ${resetLink}`,
          react: React.createElement(PasswordResetEmail, { resetLink }),
        });
      } catch {
        /* - Falha silenciosa de propósito: o usuário não pode saber se o e-mail existe - */
      }
    });
  }

  return true;
};

export { requestPasswordReset };
