"use server";

import { checkRateLimit, resetRateLimit } from "@/lib/server/rate-limit/rateLimiter";
import { compare } from "../../lib/server/services/bcrypt";
import { cookies } from "next/headers";
import { createSession } from "../../lib/server/session/createSession";
import { prisma } from "../../lib/server/services/prisma";
import { signInSchema } from "../../lib/validations/authentication/signInSchema";
import z from "zod";

const signIn = async ({ typedEmail, typedPassword, rememberMe }: z.infer<typeof signInSchema> & { rememberMe: boolean }) => {
  const parsedSignInUser = signInSchema.safeParse({ typedEmail, typedPassword, rememberMe });

  if (!parsedSignInUser.success) {
    return false;
  }

  /* - Limite por conta (força bruta numa conta) e por IP (varredura de várias contas) - */

  const accountRateLimit = await checkRateLimit({ action: "signIn", identifier: typedEmail, limit: 5, windowSeconds: 15 * 60 });
  const ipRateLimit = await checkRateLimit({ action: "signIn-ip", limit: 30, windowSeconds: 15 * 60 });

  if (!accountRateLimit.allowed || !ipRateLimit.allowed) {
    return "too_many_attempts";
  }

  const validUser = await prisma.user.findUnique({ where: { email: typedEmail } });

  if (!validUser) {
    return false;
  }

  const newUser = {
    id: validUser.id,
    name: validUser.name,
    email: validUser.email,
    role: validUser.role,
  };

  const isValidPassword = await compare(typedPassword, validUser.password);

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

    await resetRateLimit("signIn", typedEmail);

    return newUser;
  } catch {
    return false;
  }
};

export { signIn };
