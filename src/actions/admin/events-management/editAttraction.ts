"use server";

import { editAttractionSchema } from "@/lib/validations";
import z from "zod";
import { checkIsAdmin } from "../checkIsAdmin";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const editAttraction = async (attraction: z.infer<typeof editAttractionSchema>) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedAttraction = editAttractionSchema.safeParse(attraction);

  if (!parsedAttraction.success) {
    return false;
  }

  const baseAttractionData = {
    name: parsedAttraction.data.name,
    description: parsedAttraction.data.description,
  };

  const imageFile = parsedAttraction.data.image;

  try {
    if (imageFile) {
      /* - Se houver troca de imagem - */

      const blob = await put(`${Date.now()}-${imageFile.name}`, imageFile, { access: "public" });

      const editedAttraction = await prisma.attraction.update({
        where: { id: parsedAttraction.data.attractionId },
        data: { ...baseAttractionData, image: blob.url },
      });

      return {
        id: editedAttraction.id,
        name: editedAttraction.name,
        description: editedAttraction.description,
        image: editedAttraction.image,

        createdAt: editedAttraction.createdAt.toISOString(),
        updatedAt: editedAttraction.updatedAt.toISOString(),
      };
    }

    /* - Se não houver troca de imagem - */

    const editedAttraction = await prisma.attraction.update({
      where: { id: parsedAttraction.data.attractionId },
      data: { ...baseAttractionData },
    });

    return {
      id: editedAttraction.id,
      name: editedAttraction.name,
      description: editedAttraction.description,
      image: editedAttraction.image,

      createdAt: editedAttraction.createdAt.toISOString(),
      updatedAt: editedAttraction.updatedAt.toISOString(),
    };
  } catch {
    return false;
  }
};

export { editAttraction };
