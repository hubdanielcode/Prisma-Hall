"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { editProductSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import z from "zod";

const editProduct = async (product: z.infer<typeof editProductSchema>) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedProduct = editProductSchema.safeParse(product);

  if (!parsedProduct.success) {
    console.log(parsedProduct.error.issues);
    return false;
  }

  const baseProductData = {
    name: parsedProduct.data.name,
    description: parsedProduct.data.description,
    category: parsedProduct.data.category,
    price: parsedProduct.data.price,
    status: parsedProduct.data.status,
  };

  const imageFile = parsedProduct.data.image;

  try {
    if (imageFile) {
      /* - Se houver troca de imagem - */

      const blob = await put(`${Date.now()}-${imageFile.name}`, imageFile, { access: "public" });

      const editedProduct = await prisma.product.update({
        where: { id: parsedProduct.data.productId },
        data: { ...baseProductData, image: blob.url },
      });

      return {
        id: editedProduct.id,
        name: editedProduct.name,
        description: editedProduct.description,
        category: editedProduct.category,
        image: editedProduct.image,
        price: editedProduct.price.toNumber(),
        status: editedProduct.status,

        createdAt: editedProduct.createdAt.toISOString(),
        updatedAt: editedProduct.updatedAt.toISOString(),
      };
    }

    /* - Se não houver troca de imagem - */

    const editedProduct = await prisma.product.update({
      where: { id: parsedProduct.data.productId },
      data: { ...baseProductData },
    });

    return {
      id: editedProduct.id,
      name: editedProduct.name,
      description: editedProduct.description,
      category: editedProduct.category,
      image: editedProduct.image,
      price: editedProduct.price.toNumber(),
      status: editedProduct.status,

      createdAt: editedProduct.createdAt.toISOString(),
      updatedAt: editedProduct.updatedAt.toISOString(),
    };
  } catch {
    return false;
  }
};

export { editProduct };
