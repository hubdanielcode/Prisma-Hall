"use server";

import { checkIsAdmin } from "../../checkIsAdmin";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import z from "zod";

const deleteAttraction = async (attractionId: string) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedAttractionId = z.uuid().safeParse(attractionId);

  if (!parsedAttractionId.success) {
    return false;
  }

  try {
    const attractionToDelete = await prisma.attraction.findUnique({
      where: { id: parsedAttractionId.data },
      select: { image: true },
    });

    if (!attractionToDelete) {
      return false;
    }

    await prisma.attraction.delete({ where: { id: parsedAttractionId.data } });

    /* - A imagem só é removida do Blob depois que a atração foi excluída. Uma falha na remoção não desfaz a exclusão - */

    try {
      await del(attractionToDelete.image);
    } catch {
      // A atração continua excluída mesmo sem a remoção da imagem
    }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2003") {
      const errorMeta = JSON.stringify(error.meta);

      if (errorMeta.includes("attraction")) {
        return "attraction_in_use";
      }
    }
    return false;
  }

  return true;
};

export { deleteAttraction };
