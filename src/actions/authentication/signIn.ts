"use server";

import { checkRateLimit, resetRateLimit, compare, hash, createSession, prisma } from "@/lib/server";
import { cookies } from "next/headers";
import { signInSchema } from "@/lib/validations/authentication/signInSchema";
import z from "zod";

/* - Hash falso que é calculado uma vez só e é usado quando o e-mail não existe. Isso serve para o tempo de resposta ser igual ao de um e-mail existente com senha errada, evitando vazar a informação de que o email existe, ou não, no banco de dados - */

let dummyHashPromise: Promise<string> | undefined;

const getDummyHash = () => {
  dummyHashPromise ??= hash("senha-falsa-para-igualar-o-tempo-de-resposta", 10);

  return dummyHashPromise;
};

const signIn = async ({ typedEmail, typedPassword, rememberMe }: z.infer<typeof signInSchema> & { rememberMe: boolean }) => {
  const parsedSignInUser = signInSchema.safeParse({ typedEmail, typedPassword, rememberMe });

  if (!parsedSignInUser.success) {
    return false;
  }

  const validEmail = parsedSignInUser.data.typedEmail;
  const validPassword = parsedSignInUser.data.typedPassword;

  /* - Limite por conta em qualquer IP (força bruta numa conta, mesmo trocando de IP) e por IP (varredura de várias contas) - */

  const accountRateLimit = await checkRateLimit({ action: "signIn", identifier: validEmail, limit: 10, windowSeconds: 15 * 60, includeIp: false });
  const ipRateLimit = await checkRateLimit({ action: "signIn-ip", limit: 30, windowSeconds: 15 * 60 });

  if (!accountRateLimit.allowed || !ipRateLimit.allowed) {
    return "too_many_attempts";
  }

  const validUser = await prisma.user.findUnique({ where: { email: validEmail } });

  if (!validUser) {
    await compare(validPassword, await getDummyHash());

    return false;
  }

  const newUser = {
    id: validUser.id,
    name: validUser.name,
    email: validUser.email,
    role: validUser.role,
  };

  const isValidPassword = await compare(validPassword, validUser.password);

  if (!isValidPassword) {
    return false;
  }

  try {
    const cookieStore = await cookies();
    const validSessionCookie = cookieStore.get("validSession");
    const expiresAt = rememberMe ? new Date(Date.now() + 60 * 60 * 24 * 7 * 1000) : new Date(Date.now() + 60 * 60 * 2 * 1000);

    const activeSession = validSessionCookie ? await prisma.session.findUnique({ where: { id: validSessionCookie.value } }) : null;

    let sessionId: string;

    if (activeSession && !activeSession.revokedAt && activeSession.expiresAt > new Date() && activeSession.userId === validUser.id) {
      await prisma.session.update({
        where: { id: activeSession.id },
        data: {
          lastActivityAt: new Date(),
          expiresAt: expiresAt,
        },
      });

      sessionId = activeSession.id;
    } else {
      /* - Criando a sessão caso necessário - */

      const newSession = await createSession({ userId: validUser.id, expiresAt });
      sessionId = newSession.id;
    }

    cookieStore.set("validSession", sessionId, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: "lax",
    });

    await resetRateLimit("signIn", validEmail, false);

    return newUser;
  } catch {
    return false;
  }
};

export { signIn };
