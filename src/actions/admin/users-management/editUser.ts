"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { editUserSchema } from "@/lib/validations/admin/user-management/editUserSchema";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";
import z from "zod";

const editUser = async (user: z.infer<typeof editUserSchema>) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedUser = editUserSchema.safeParse(user);

  if (!parsedUser.success) {
    return false;
  }

  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const forceRevalidation = parsedUser.data.forceRevalidation;

  try {
    /* - Impedindo que o site fique sem nenhum admin - */

    if (parsedUser.data.userId === validSession.user.id) {
      return false;
    }

    if (forceRevalidation) {
      /* - Se houver revalidação forçada - */

      const [editedUser] = await prisma.$transaction([
        prisma.user.update({
          where: { id: parsedUser.data.userId },
          data: { role: parsedUser.data.roles, validatedAt: null, validationToken: null, validationTokenExpiresAt: null },
        }),

        /* - Revogando as sessões daquele usuário, para ele ser desconectado e só voltar a entrar depois de validar o e-mail de novo - */

        prisma.session.updateMany({
          where: { userId: parsedUser.data.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        }),
      ]);

      return {
        id: editedUser.id,
        name: editedUser.name,
        email: editedUser.email,
        role: editedUser.role,
        verifiedBadge: editedUser.verifiedBadge,
        frequentUser: editedUser.frequentUser,
        oldUser: editedUser.oldUser,
        validatedAt: editedUser.validatedAt ? editedUser.validatedAt.toISOString() : null,

        createdAt: editedUser.createdAt.toISOString(),
        updatedAt: editedUser.updatedAt.toISOString(),
      };
    }

    /* - Se não houver revalidação forçada - */

    const editedUser = await prisma.user.update({
      where: { id: parsedUser.data.userId },
      data: { role: parsedUser.data.roles },
    });

    return {
      id: editedUser.id,
      name: editedUser.name,
      email: editedUser.email,
      role: editedUser.role,
      verifiedBadge: editedUser.verifiedBadge,
      frequentUser: editedUser.frequentUser,
      oldUser: editedUser.oldUser,
      validatedAt: editedUser.validatedAt ? editedUser.validatedAt.toISOString() : null,

      createdAt: editedUser.createdAt.toISOString(),
      updatedAt: editedUser.updatedAt.toISOString(),
    };
  } catch {
    return false;
  }
};

export { editUser };
