"use server";

import { checkRateLimit, resetRateLimit, compare, prisma } from "@/lib/server";
import { makeAnonymous } from "@/lib/server/users/makeAnonymous";
import { validateSession } from "../../session/validateSession";

const deleteProfile = async (password: string) => {
  /* - Validando a sessão e a senha digitada - */

  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  if (typeof password !== "string" || !password) {
    return false;
  }

  /* - Limitando as tentativas de senha, para a exclusão não servir de brecha para adivinhar a senha - */

  const rateLimit = await checkRateLimit({
    action: "deleteProfile",
    identifier: validSession.user.id,
    limit: 5,
    windowSeconds: 15 * 60,
    includeIp: false,
  });

  if (!rateLimit.allowed) {
    return "too_many_attempts";
  }

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id: validSession.user.id },
      select: { password: true },
    });

    if (!userToDelete) {
      return false;
    }

    const isValidPassword = await compare(password, userToDelete.password);

    if (!isValidPassword) {
      return "invalid_password";
    }

    await resetRateLimit("deleteProfile", validSession.user.id, false);

    return await makeAnonymous(validSession.user.id);
  } catch {
    return false;
  }
};

export { deleteProfile };
