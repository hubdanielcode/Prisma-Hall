"use server";

import { checkIsAdmin } from "../../checkIsAdmin";
import { createAttractionSchema } from "@/lib/validations/admin/events-management/attraction-management/createAttractionSchema";
import { del, put } from "@vercel/blob";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import z from "zod";

const createAttraction = async (attraction: z.infer<typeof createAttractionSchema>) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedAttraction = createAttractionSchema.safeParse(attraction);

  if (!parsedAttraction.success) {
    return false;
  }

  const imageFile = parsedAttraction.data.image;

  /* - Guarda a imagem enviada enquanto a atração ainda não existe no banco - */

  let newImageUrl: string | null = null;

  try {
    const blob = await put(`${Date.now()}-${imageFile.name}`, imageFile, { access: "public" });

    newImageUrl = blob.url;

    const newAttraction = await prisma.attraction.create({
      data: {
        name: parsedAttraction.data.name,
        description: parsedAttraction.data.description,
        image: blob.url,
      },
    });

    /* - A atração já existe e é dona da imagem: o catch não pode mais apagá-la - */

    newImageUrl = null;

    return {
      id: newAttraction.id,
      name: newAttraction.name,
      description: newAttraction.description,
      image: newAttraction.image,

      createdAt: newAttraction.createdAt.toISOString(),
      updatedAt: newAttraction.updatedAt.toISOString(),
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
      return "name_is_not_unique";
    }

    return false;
  }
};

export { createAttraction };
