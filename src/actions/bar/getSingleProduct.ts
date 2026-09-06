"use server";

import { prisma } from "@/lib/prisma";

const getSingleProduct = async (productId: string) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      return null;
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      image: product.image,
      price: product.price.toNumber(),
      status: product.status,

      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  } catch {
    throw new Error("Erro ao buscar produto.");
  }
};

export { getSingleProduct };
