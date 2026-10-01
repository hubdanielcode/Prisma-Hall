"use server";

import { createAttractionSchema } from "@/lib/validations";
import z from "zod";
import { checkIsAdmin } from "../checkIsAdmin";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

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

  try {
    const blob = await put(`${Date.now()}-${imageFile.name}`, imageFile, { access: "public" });

    const newAttraction = await prisma.attraction.create({
      data: {
        name: parsedAttraction.data.name,
        description: parsedAttraction.data.description,
        image: blob.url,
      },
    });

    return {
      id: newAttraction.id,
      name: newAttraction.name,
      description: newAttraction.description,

      createdAt: newAttraction.createdAt.toISOString(),
      updatedAt: newAttraction.updatedAt.toISOString(),
    };
  } catch {
    return false;
  }
};

export { createAttraction };
