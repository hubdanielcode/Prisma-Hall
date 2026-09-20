"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { prisma } from "@/lib/prisma";

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
