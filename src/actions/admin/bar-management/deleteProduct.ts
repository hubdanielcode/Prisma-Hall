"use server";

import { prisma } from "@/lib/prisma";
import { checkIsAdmin } from "../checkIsAdmin";

const deleteProduct = async (productId: string) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  try {
    await prisma.product.delete({ where: { id: productId } });

    return true;
  } catch {
    return false;
  }
};

export { deleteProduct };
