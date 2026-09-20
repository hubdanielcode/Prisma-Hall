"use server";

import { compare } from "bcrypt";
import { cookies } from "next/headers";
import { createSession } from "../session/createSession";
import { prisma } from "@/lib/prisma";
import { signInSchema } from "@/lib/validations/authentication/signInSchema";

interface SignInProps {
  typedEmail: string;
  typedPassword: string;
  rememberMe: boolean;
}

const signIn = async ({ typedEmail, typedPassword, rememberMe }: SignInProps) => {
  const parsedSignInUser = signInSchema.safeParse({ email: typedEmail, password: typedPassword });

  if (!parsedSignInUser.success) {
    return false;
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

    cookieStore.set("validSession", sessionId, { httpOnly: true, secure: true, expires: expiresAt, sameSite: "lax" });

    return newUser;
  } catch {
    return false;
  }
};

export { signIn };
