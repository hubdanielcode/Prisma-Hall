"use server";

import { createProductSchema } from "@/lib/validations";
import z from "zod";
import { checkIsAdmin } from "../checkIsAdmin";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const createProduct = async (product: z.infer<typeof createProductSchema>) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedProduct = createProductSchema.safeParse(product);

  if (!parsedProduct.success) {
    console.log(parsedProduct.error.issues);
    return false;
  }

  const imageFile = parsedProduct.data.image;

  try {
    const blob = await put(`${Date.now()}-${imageFile.name}`, imageFile, { access: "public" });

    const newProduct = await prisma.product.create({
      data: {
        name: parsedProduct.data.name,
        description: parsedProduct.data.description,
        category: parsedProduct.data.category,
        image: blob.url,
        price: parsedProduct.data.price,
        status: parsedProduct.data.status,
      },
    });

    return {
      id: newProduct.id,
      name: newProduct.name,
      category: newProduct.category,
      description: newProduct.description,
      image: newProduct.image,
      price: newProduct.price.toNumber(),
      status: newProduct.status,

      createdAt: newProduct.createdAt.toISOString(),
      updatedAt: newProduct.updatedAt.toISOString(),
    };
  } catch {
    return false;
  }
};

export { createProduct };
