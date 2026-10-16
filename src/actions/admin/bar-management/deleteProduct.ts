"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import z from "zod";

const deleteProduct = async (productId: string) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedProductId = z.uuid().safeParse(productId);

  if (!parsedProductId.success) {
    return false;
  }

  try {
    const productToDelete = await prisma.product.findUnique({ where: { id: parsedProductId.data }, select: { image: true } });

    if (!productToDelete) {
      return false;
    }

    await prisma.product.delete({ where: { id: parsedProductId.data } });

    /* - A imagem só é removida do Blob depois que o produto foi excluído. Uma falha na remoção não desfaz a exclusão - */

    try {
      await del(productToDelete.image);
    } catch {
      // O produto continua excluído mesmo sem a remoção da imagem
    }

    return true;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2003") {
      const errorMeta = JSON.stringify(error.meta);

      if (errorMeta.includes("product")) {
        return "product_in_use";
      }
    }

    return false;
  }
};

export { deleteProduct };
