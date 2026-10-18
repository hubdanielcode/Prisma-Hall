"use server";

import { checkRateLimit } from "@/lib/server/rate-limit/rateLimiter";
import { hash } from "@/lib/server/services/bcrypt";
import { passwordResetSchema } from "@/lib/validations/authentication/passwordResetSchema";
import { prisma } from "@/lib/server/services/prisma";
import z from "zod";

const passwordReset = async (passwordResetRequest: z.infer<typeof passwordResetSchema>) => {
  const parsedPasswordReset = passwordResetSchema.safeParse(passwordResetRequest);

  if (!parsedPasswordReset.success) {
    return false;
  }

  const rateLimit = await checkRateLimit({ action: "pwd-reset", limit: 10, windowSeconds: 15 * 60 });

  if (!rateLimit.allowed) {
    return "too_many_attempts";
  }

  const validToken = parsedPasswordReset.data.token;
  const validResetedPassword = parsedPasswordReset.data.password;

  const user = await prisma.user.findUnique({ where: { token: validToken } });

  if (!user) {
    return false;
  }

  try {
    const tokenExpiresAt = user.tokenExpiresAt;

    if (!tokenExpiresAt || tokenExpiresAt < new Date()) {
      return false;
    }

    const hashedResetedPassword = await hash(validResetedPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { token: validToken },
        data: {
          password: hashedResetedPassword,
          token: null,
          tokenExpiresAt: null,
        },
      }),

      /* - Revogando a sessão daquele usuário depois que a senha foi trocada - */

      prisma.session.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),

      /* - Apagando todas as sessões daquele usuário depois que a senha foi trocada, para quem estiver logado com a senha antiga ser desconectado - */

      prisma.session.deleteMany({ where: { userId: user.id } }),
    ]);

    return true;
  } catch {
    return false;
  }
};

export { passwordReset };
