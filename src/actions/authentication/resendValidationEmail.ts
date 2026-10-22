"use server";

import { after } from "next/server";
import { checkRateLimit, prisma, sendValidationEmail } from "@/lib/server";
import { resendValidationEmailSchema } from "@/lib/validations/authentication/resendValidationEmailSchema";

const resendValidationEmail = async (email: string) => {
  const validEmail = resendValidationEmailSchema.safeParse(email);

  /* - Formato inválido não revela nada sobre o banco, porque depende só do texto digitado - */

  if (!validEmail.success) {
    return false;
  }

  /* - Os limites valem para qualquer e-mail, exista ou não, então não revelam nada sobre o banco - */

  // 1. Intervalo mínimo de 60 segundos entre os envios para o mesmo e-mail (o e-mail do cadastro também conta)

  const cooldownRateLimit = await checkRateLimit({
    action: "validation-cooldown",
    identifier: validEmail.data,
    limit: 1,
    windowSeconds: 60,
    includeIp: false,
  });

  if (!cooldownRateLimit.allowed) {
    return "too_soon";
  }

  // 2. Máximo de 4 envios por hora, por e-mail e por IP

  const emailRateLimit = await checkRateLimit({
    action: "validation-request",
    identifier: validEmail.data,
    limit: 4,
    windowSeconds: 60 * 60,
    includeIp: false,
  });
  const ipRateLimit = await checkRateLimit({ action: "validation-request-ip", limit: 4, windowSeconds: 60 * 60 });

  if (!emailRateLimit.allowed || !ipRateLimit.allowed) {
    return "too_many_attempts";
  }

  const user = await prisma.user.findUnique({ where: { email: validEmail.data } });

  /* - Daqui em diante a resposta é sempre true, exista o e-mail ou não, e a conta já esteja validada ou não. O trabalho de verdade (token + envio) roda depois da resposta, para que nem o resultado nem o tempo de resposta entreguem se o e-mail existe - */

  if (user && !user.validatedAt) {
    after(async () => {
      try {
        await sendValidationEmail({ userId: user.id, name: user.name, email: user.email });
      } catch (error) {
        // O usuário não pode saber se o e-mail existe, então o erro só vai para o log do servidor
        console.error("[validation-email] resend:", error);
      }
    });
  }

  return true;
};

export { resendValidationEmail };
