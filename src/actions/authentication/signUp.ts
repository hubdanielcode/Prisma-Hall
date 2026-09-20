"use server";

import { cookies } from "next/headers";
import { createSession } from "../session/createSession";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations/authentication/signUpSchema";

interface SignUpProps {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const signUp = async ({ name, email, password, confirmPassword }: SignUpProps) => {
  const parsedSignUpUser = signUpSchema.safeParse({ name, email, password, confirmPassword });

  if (!parsedSignUpUser.success) {
    return false;
  }

  const validPassword = parsedSignUpUser.data.password;

  let newUser;

  try {
    const hashedUserPassword = await hash(validPassword, 10);

    newUser = await prisma.user.create({
      data: {
        name: parsedSignUpUser.data.name,
        email: parsedSignUpUser.data.email,
        password: hashedUserPassword,
      },
    });
  } catch (error) {
    return false;
  }

  const newlyCreatedUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };

  /* - Criando a sessão após o cadastro - */

  try {
    const cookieStore = await cookies();

    const userId = newUser.id;
    const expiresAt = new Date(Date.now() + 60 * 60 * 2 * 1000);

    const newSession = await createSession({ userId, expiresAt });

    cookieStore.set("validSession", newSession.id, { httpOnly: true, secure: true, expires: expiresAt, sameSite: "lax" });
  } catch (error) {
    return false;
  }

  return newlyCreatedUser;
};

export { signUp };
