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
    return true;
  } catch {
    return false;
  }
};

export { deleteAttraction };
