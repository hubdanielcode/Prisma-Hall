"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { editUserSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
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

  const baseUserData = {
    role: parsedUser.data.roles,
    verifiedBadge: parsedUser.data.verifiedUser,
    frequentUser: parsedUser.data.frequentUser,
    oldUser: parsedUser.data.oldUser,
  };

  const forceRevalidation = parsedUser.data.forceRevalidation;

  try {
    if (forceRevalidation) {
      /* - Se houver revalidação forçada - */

      const editedUser = await prisma.user.update({
        where: { id: parsedUser.data.userId },
        data: { ...baseUserData, validatedAt: null },
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
    }

    /* - Se não houver revalidação forçada - */

    const editedUser = await prisma.user.update({
      where: { id: parsedUser.data.userId },
      data: { ...baseUserData },
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
