"use server";

import { prisma } from "@/lib/prisma";

const getSingleAttraction = async (attractionId: string) => {
  try {
    const attraction = await prisma.attraction.findUnique({ where: { id: attractionId } });

    if (!attraction) {
      return false;
    }

    return {
      id: attraction.id,
      name: attraction.name,
      description: attraction.description,
      image: attraction.image,

      createdAt: attraction.createdAt.toISOString(),
      updatedAt: attraction.updatedAt.toISOString(),
    };
  } catch {
    throw new Error("Erro ao buscar atração.");
  }
};

export { getSingleAttraction };
