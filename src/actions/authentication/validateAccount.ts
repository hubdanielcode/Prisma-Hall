"use server";

import {
  checkRateLimit,
  clearValidationBrowserCookie,
  createSession,
  doesValidationBrowserMatch,
  prisma,
  readValidationBrowserHash,
} from "@/lib/server";
import { cookies } from "next/headers";
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

  let userJustValidated: { id: string; validationBrowserHash: string | null };

  try {
    const userToValidate = await prisma.user.findFirst({
      where: { validationToken: validToken.data, validationTokenExpiresAt: { gt: new Date() } },
      select: { id: true, validationBrowserHash: true, validatedAt: true, needsRevalidation: true },
    });

    if (!userToValidate) {
      return false;
    }

    /* - O token continua no filtro da gravação: a checagem de validade e a gravação acontecem numa única operação do banco, então o link só funciona uma vez, mesmo que seja aberto em dois lugares ao mesmo tempo. Quem perde a corrida recebe count 0 e não ganha sessão - */

    const validatedUser = await prisma.user.updateMany({
      where: { id: userToValidate.id, validationToken: validToken.data, validationTokenExpiresAt: { gt: new Date() } },
      data: {
        /* - O validatedAt guarda só a primeira validação e nunca é sobrescrito. Uma validação feita depois de o admin forçar a revalidação vai para o revalidatedAt - */
        validatedAt: userToValidate.validatedAt ?? new Date(),
        revalidatedAt: userToValidate.validatedAt && userToValidate.needsRevalidation ? new Date() : undefined,
        needsRevalidation: false,
        validationToken: null,
        validationTokenExpiresAt: null,
        validationBrowserHash: null,
      },
    });

    if (validatedUser.count === 0) {
      return false;
    }

    userJustValidated = { id: userToValidate.id, validationBrowserHash: userToValidate.validationBrowserHash };
  } catch {
    return false;
  }

  /* - A sessão só é criada se este navegador for o que fez o cadastro (a chave do cookie bate com o hash guardado). Com o link vindo de outro lugar, a conta é validada do mesmo jeito, mas o usuário entra pelo login com a senha. Qualquer falha daqui para baixo não desfaz a validação, só cai nesse mesmo caminho - */

  try {
    const browserValidationBrowserHash = await readValidationBrowserHash();

    const isSameBrowserThatSignedUp = doesValidationBrowserMatch({
      storedValidationBrowserHash: userJustValidated.validationBrowserHash,
      browserValidationBrowserHash,
    });

    if (!isSameBrowserThatSignedUp) {
      return "validated";
    }

    const cookieStore = await cookies();
    const sessionExpiresAt = new Date(Date.now() + 60 * 60 * 2 * 1000);
    const newSession = await createSession({ userId: userJustValidated.id, expiresAt: sessionExpiresAt });

    cookieStore.set("validSession", newSession.id, {
      httpOnly: true,
      secure: true,
      expires: sessionExpiresAt,
      sameSite: "lax",
    });

    await clearValidationBrowserCookie();

    return "validated_and_signed_in";
  } catch {
    return "validated";
  }
};

export { validateAccount };
