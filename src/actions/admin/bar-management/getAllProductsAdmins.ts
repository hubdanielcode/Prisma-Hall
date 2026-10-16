"use server";

import { prisma } from "@/lib/server/services/prisma";
import { checkIsAdmin } from "../checkIsAdmin";

const getAllProductsAdmins = async () => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    throw new Error("Acesso negado.");
  }

  try {
    const products = await prisma.product.findMany();

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      image: product.image,
      price: product.price.toNumber(),
      quantity: product.quantity,
      status: product.status,

      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));
  } catch {
    throw new Error("Erro ao buscar produtos.");
  }
};

export { getAllProductsAdmins };
