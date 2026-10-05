"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { prisma } from "@/lib/prisma";

const deleteAttraction = async (attractionId: string) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  try {
    await prisma.attraction.delete({ where: { id: attractionId } });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2003") {
      return "attraction_in_use";
    }

    return false;
  }
  return true;
};

export { deleteAttraction };
