"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { prisma } from "@/lib/prisma";

const getSingleUser = async (userId: string) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    throw new Error("Acesso negado.");
  }

  try {
    /* - Select restrito: password, token e tokenExpiresAt nunca saem do banco - */

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verifiedBadge: true,
        frequentUser: true,
        oldUser: true,
        profilePicture: true,
        validatedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return false;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verifiedBadge: user.verifiedBadge,
      frequentUser: user.frequentUser,
      oldUser: user.oldUser,
      profilePicture: user.profilePicture,
      validatedAt: user.validatedAt ? user.validatedAt.toISOString() : null,

      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  } catch {
    throw new Error("Erro ao buscar usuário.");
  }
};

export { getSingleUser };
