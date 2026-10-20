"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { del, put } from "@vercel/blob";
import { editAttractionSchema } from "@/lib/validations/admin/events-management/editAttractionSchema";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import z from "zod";

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

  /* - Guarda a imagem nova enquanto a edição ainda não foi salva no banco - */

  let newImageUrl: string | null = null;

  try {
    const originalAttraction = await prisma.attraction.findUnique({
      where: { id: parsedAttraction.data.attractionId },
      select: { image: true },
    });

    if (!originalAttraction) {
      return false;
    }

    /* - Só faz upload se houver troca de imagem - */

    if (imageFile) {
      const blob = await put(`${Date.now()}-${imageFile.name}`, imageFile, { access: "public" });

      newImageUrl = blob.url;
    }

    const editedAttraction = await prisma.attraction.update({
      where: { id: parsedAttraction.data.attractionId },
      data: { ...baseAttractionData, ...(newImageUrl && { image: newImageUrl }) },
    });

    /* - A edição foi salva e a imagem nova é da atração. A antiga só sai do Blob agora; uma falha na remoção não desfaz a edição - */

    if (newImageUrl) {
      newImageUrl = null;

      try {
        await del(originalAttraction.image);
      } catch {
        // A edição continua salva mesmo sem a remoção da imagem antiga
      }
    }

    return {
      id: editedAttraction.id,
      name: editedAttraction.name,
      description: editedAttraction.description,
      image: editedAttraction.image,

      createdAt: editedAttraction.createdAt.toISOString(),
      updatedAt: editedAttraction.updatedAt.toISOString(),
    };
  } catch (error) {
    /* - Se o banco falhou depois do upload, remove a imagem nova para não ficar órfã no Blob - */

    if (newImageUrl) {
      try {
        await del(newImageUrl);
      } catch {
        // A imagem nova fica no Blob, mas a edição não foi salva
      }
    }

    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      return "name_is_not_unique";
    }

    return false;
  }
};

export { editAttraction };
