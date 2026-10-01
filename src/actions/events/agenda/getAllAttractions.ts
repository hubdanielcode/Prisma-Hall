"use server";

import { prisma } from "@/lib/prisma";

const getAllAttractions = async () => {
  try {
    const attractions = await prisma.attraction.findMany();

    return attractions.map((attraction) => ({
      id: attraction.id,
      name: attraction.name,
      description: attraction.description,
      image: attraction.image,

      createdAt: attraction.createdAt.toISOString(),
      updatedAt: attraction.updatedAt.toISOString(),
    }));
  } catch {
    throw new Error("Erro ao buscar atrações.");
  }
};

export { getAllAttractions };
