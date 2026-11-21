"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { prisma } from "@/lib/server/services/prisma";

const getSingleUser = async (userId: string) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
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
        verifiedUserBadge: true,
        frequentUserBadge: true,
        oldUserBadge: true,
        profilePicture: true,
        validatedAt: true,
        needsRevalidation: true,
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
      verifiedBadge: user.verifiedUserBadge,
      frequentUser: user.frequentUserBadge,
      oldUser: user.oldUserBadge,
      profilePicture: user.profilePicture,
      validatedAt: user.validatedAt && !user.needsRevalidation ? user.validatedAt.toISOString() : null,

      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  } catch {
    throw new Error("Erro ao buscar usuário.");
  }
};

export { getSingleUser };
