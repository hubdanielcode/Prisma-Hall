"use server";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { checkIsAdmin } from "../checkIsAdmin";
import { prisma } from "@/lib/server/services/prisma";

const deleteAttraction = async (attractionId: string) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  try {
    await prisma.attraction.delete({ where: { id: attractionId } });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2003") {
      const errorMeta = JSON.stringify(error.meta);

      if (errorMeta.includes("attraction")) {
        return "attraction_in_use";
      }
    }
    return false;
  }

  return true;
};

export { deleteAttraction };
