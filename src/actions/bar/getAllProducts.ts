"use server";

import { prisma } from "@/lib/prisma";

const getAllProducts = async () => {
  try {
    const products = await prisma.product.findMany();

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      image: product.image,
      price: product.price.toNumber(),
      status: product.status,

      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));
  } catch {
    throw new Error("Erro ao buscar produtos.");
  }
};

export { getAllProducts };
