"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { prisma } from "@/lib/server/services/prisma";

const getUsersStats = async () => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  try {
    const [total, admins, verified, notValidated] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.user.count({ where: { verifiedBadge: true } }),
      prisma.user.count({ where: { validatedAt: null } }),
    ]);

    return { total, admins, verified, notValidated };
  } catch {
    return false;
  }
};

export { getUsersStats };
