"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { createProductSchema } from "@/lib/validations/admin/bar-management/createProductSchema";
import { del, put } from "@vercel/blob";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@/prisma/generated/prisma/internal/prismaNamespace";
import z from "zod";

const createProduct = async (product: z.infer<typeof createProductSchema>) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedProduct = createProductSchema.safeParse(product);

  if (!parsedProduct.success) {
    return false;
  }

  const imageFile = parsedProduct.data.image;

  let newImageUrl: string | undefined;

  try {
    const blob = await put(`${Date.now()}-${imageFile.name}`, imageFile, { access: "public" });

    newImageUrl = blob.url;

    const newProduct = await prisma.product.create({
      data: {
        name: parsedProduct.data.name,
        description: parsedProduct.data.description,
        category: parsedProduct.data.category,
        quantity: parsedProduct.data.quantity,
        image: blob.url,
        price: parsedProduct.data.price,
        status: parsedProduct.data.status,
      },
    });

    return {
      id: newProduct.id,
      name: newProduct.name,
      description: newProduct.description,
      category: newProduct.category,
      quantity: newProduct.quantity,
      image: newProduct.image,
      price: newProduct.price.toNumber(),
      status: newProduct.status,

      createdAt: newProduct.createdAt.toISOString(),
      updatedAt: newProduct.updatedAt.toISOString(),
    };
  } catch (error) {
    /* - Se o banco falhou depois do upload, remove a imagem nova para não ficar órfã no Blob - */

    if (newImageUrl) {
      try {
        await del(newImageUrl);
      } catch {
        // A imagem nova fica no Blob, mas nada foi salvo no banco
      }
    }

    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      const errorMeta = JSON.stringify(error.meta);

      if (errorMeta.includes("name")) {
        return "name_is_not_unique";
      }

      if (errorMeta.includes("description")) {
        return "description_is_not_unique";
      }
    }

    return false;
  }
};

export { createProduct };
