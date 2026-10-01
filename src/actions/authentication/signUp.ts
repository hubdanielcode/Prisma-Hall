"use server";

import { cookies } from "next/headers";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations";
import z from "zod";

const signUp = async (user: z.infer<typeof signUpSchema>) => {
  const parsedSignUpUser = signUpSchema.safeParse(user);

  if (!parsedSignUpUser.success) {
    return false;
  }

  const validPassword = parsedSignUpUser.data.password;
  const expiresAt = new Date(Date.now() + 60 * 60 * 2 * 1000);

  try {
    const hashedUserPassword = await hash(validPassword, 10);
    const { newUser, newSession } = await prisma.$transaction(async (transaction) => {
      /* - Criando o usuário - */

      const newlyCreatedUser = await transaction.user.create({
        data: {
          name: parsedSignUpUser.data.name,
          email: parsedSignUpUser.data.email,
          password: hashedUserPassword,
        },
      });

      /* - Criando a sessão - */

      const newlyCreatedSession = await transaction.session.create({
        data: {
          userId: newlyCreatedUser.id,
          expiresAt: expiresAt,
        },
      });

      return { newUser: newlyCreatedUser, newSession: newlyCreatedSession };
    });

    const cookieStore = await cookies();

    cookieStore.set("validSession", newSession.id, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: expiresAt,
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
  } catch {
    console.log("criação do user falhou");

    return false;
  }
};

export { signUp };
