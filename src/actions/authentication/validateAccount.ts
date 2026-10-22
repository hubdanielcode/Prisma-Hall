"use server";

import { checkRateLimit, prisma } from "@/lib/server";
import { validateAccountSchema } from "@/lib/validations/authentication/validateAccountSchema";

const validateAccount = async (token: string) => {
  const validToken = validateAccountSchema.safeParse(token);

  if (!validToken.success) {
    return false;
  }

  const rateLimit = await checkRateLimit({ action: "validate-account", limit: 10, windowSeconds: 15 * 60 });

  if (!rateLimit.allowed) {
    return "too_many_attempts";
  }

  try {
    /* - A busca, a checagem de validade e a gravação acontecem numa única operação do banco, então o link só funciona uma vez, mesmo que seja aberto em dois lugares ao mesmo tempo - */

    const validatedUser = await prisma.user.updateMany({
      where: { validationToken: validToken.data, validationTokenExpiresAt: { gt: new Date() } },
      data: { validatedAt: new Date(), validationToken: null, validationTokenExpiresAt: null },
    });

    return validatedUser.count > 0;
  } catch {
    return false;
  }
};

export { validateAccount };
