"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { getAllUsersSchema } from "@/lib/validations/admin/user-management/getAllUsersSchema";
import { prisma } from "@/lib/server/services/prisma";
import z from "zod";

const getAllUsers = async (allUsers: z.infer<typeof getAllUsersSchema>) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedAllUsers = getAllUsersSchema.safeParse(allUsers);

  if (!parsedAllUsers.success) {
    return false;
  }

  const currentPage = parsedAllUsers.data.currentPage;
  const itemsPerPage = parsedAllUsers.data.itemsPerPage;
  const searchQuery = parsedAllUsers.data.searchQuery;
  const selectedRole = parsedAllUsers.data.selectedRole;
  const selectedStatus = parsedAllUsers.data.selectedStatus;

  try {
    /* - Filtros aplicados no banco - */

    const where = {
      ...(searchQuery
        ? {
            OR: [
              { name: { contains: searchQuery, mode: "insensitive" as const } },
              { email: { contains: searchQuery, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(selectedRole !== "all_roles" ? { role: selectedRole } : {}),
      ...(selectedStatus === "validated" ? { validatedAt: { not: null } } : {}),
      ...(selectedStatus === "not_validated" ? { validatedAt: null } : {}),
    };

    /* - Select restrito: password, token e tokenExpiresAt nunca saem do banco - */

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
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
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
      }),
    ]);

    return {
      users: users.map((user) => ({
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
      })),
      total,
      totalPages: Math.ceil(total / itemsPerPage),
    };
  } catch {
    return false;
  }
};

export { getAllUsers };
