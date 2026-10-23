"use server";

import { checkIsAdmin } from "../../checkIsAdmin";
import { createGalleryPictureSchema } from "@/lib/validations/admin/events-management/gallery-management/createGalleryPictureSchema";
import { del, put } from "@vercel/blob";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { validateSession } from "@/actions/authentication/validateSession";
import z from "zod";

const createGalleryPicture = async (picture: z.infer<typeof createGalleryPictureSchema>) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedPicture = createGalleryPictureSchema.safeParse(picture);

  if (!parsedPicture.success) {
    return false;
  }

  /* - A foto fica registrada no nome do admin que enviou - */

  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const imageFile = parsedPicture.data.image;

  let newImageUrl: string | undefined;

  try {
    const blob = await put(`${Date.now()}-${imageFile.name}`, imageFile, { access: "public" });

    newImageUrl = blob.url;

    const newPicture = await prisma.gallery.create({
      data: {
        userId: validSession.user.id,
        eventId: parsedPicture.data.eventId,
        image: blob.url,
        title: parsedPicture.data.title,
        happenedAt: parsedPicture.data.happenedAt,
      },
    });

    return {
      id: newPicture.id,
      userId: newPicture.userId,
      eventId: newPicture.eventId,
      image: newPicture.image,
      title: newPicture.title,
      happenedAt: newPicture.happenedAt.toISOString(),

      createdAt: newPicture.createdAt.toISOString(),
      updatedAt: newPicture.updatedAt.toISOString(),
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

    if (error instanceof PrismaClientKnownRequestError && error.code === "P2003") {
      return "event_not_found";
    }

    return false;
  }
};

export { createGalleryPicture };
