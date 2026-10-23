import "server-only";
import { getResend } from "../services/resend";
import { prisma } from "../services/prisma";
import { ValidateAccountEmail } from "@/shared/emails/ValidateAccountEmail";
import React from "react";

interface SendValidationEmailProps {
  userId: string;
  name: string;
  email: string;
  validationBrowserHash?: string | null;
}

/* - Gera um token novo (que invalida o anterior), grava no banco e envia o link por e-mail. O token fica em colunas próprias, separadas das da recuperação de senha, para os dois fluxos nunca se misturarem. O hash da amarração com o navegador (quando existe) também é trocado junto com o token, então um link novo nunca herda a amarração do anterior - */

const sendValidationEmail = async ({ userId, name, email, validationBrowserHash }: SendValidationEmailProps) => {
  const validationToken = crypto.randomUUID();
  const validationTokenExpiresAt = new Date(Date.now() + 60 * 15 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: { validationToken, validationTokenExpiresAt, validationBrowserHash: validationBrowserHash ?? null },
  });

  const validationLink = `${process.env.NEXT_PUBLIC_APP_URL}/validar-conta?token=${validationToken}`;

  const { error } = await getResend().emails.send({
    from: process.env.EMAIL_FROM ?? "Prisma Hall <onboarding@resend.dev>",
    to: email,
    subject: "Valide a sua conta no Prisma Hall",
    text: `Olá, ${name}! Para validar a sua conta, acesse o link: ${validationLink}`,
    react: React.createElement(ValidateAccountEmail, { name, validationLink }),
  });

  /* - O Resend não lança erro quando a API recusa o envio (domínio não verificado, chave inválida...): ele devolve o erro no retorno. Por isso a checagem é manual - */

  if (error) {
    throw new Error(`Falha ao enviar o e-mail de validação: ${error.name} - ${error.message}`);
  }
};

export { sendValidationEmail };
