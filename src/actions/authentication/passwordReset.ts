"use server";

import { hash } from "bcrypt";
import { passwordResetSchema } from "@/lib/validations/authentication/passwordResetSchemas";
import { prisma } from "@/lib/prisma";

interface PasswordResetProps {
  token: string;
  password: string;
  confirmPassword: string;
}

const passwordReset = async ({ token, password, confirmPassword }: PasswordResetProps) => {
  const parsedPasswordReset = passwordResetSchema.safeParse({ token, password, confirmPassword });

  if (!parsedPasswordReset.success) {
    return false;
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

    await prisma.user.update({
      where: { token: validToken },
      data: {
        password: hashedResetedPassword,
        token: null,
        tokenExpiresAt: null,
      },
    });

    return true;
  } catch {
    return false;
  }
};

export { passwordReset };
