"use server";

import { checkIsAdmin } from "../../checkIsAdmin";
import { del, put } from "@vercel/blob";
import { editGalleryPictureSchema } from "@/lib/validations/admin/events-management/gallery-management/editGalleryPictureSchema";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import z from "zod";

const editGalleryPicture = async (picture: z.infer<typeof editGalleryPictureSchema>) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedPicture = editGalleryPictureSchema.safeParse(picture);

  if (!parsedPicture.success) {
    return false;
  }

  const basePictureData = {
    eventId: parsedPicture.data.eventId,
    title: parsedPicture.data.title,
    happenedAt: parsedPicture.data.happenedAt,
  };

  const imageFile = parsedPicture.data.image;

  let newImageUrl: string | undefined;

  try {
    if (imageFile) {
      /* - Se houver troca de imagem - */

      const pictureBeforeEdit = await prisma.gallery.findUnique({ where: { id: parsedPicture.data.pictureId }, select: { image: true } });

      const blob = await put(`${Date.now()}-${imageFile.name}`, imageFile, { access: "public" });

      newImageUrl = blob.url;

      const editedPicture = await prisma.gallery.update({
        where: { id: parsedPicture.data.pictureId },
        data: { ...basePictureData, image: blob.url },
      });

      /* - A imagem antiga só é removida do Blob depois que a edição foi salva. Uma falha na remoção não desfaz a edição - */

      if (pictureBeforeEdit) {
        try {
          await del(pictureBeforeEdit.image);
        } catch {
          // A edição continua salva mesmo sem a remoção da imagem antiga
        }
      }

      return {
        id: editedPicture.id,
        userId: editedPicture.userId,
        eventId: editedPicture.eventId,
        image: editedPicture.image,
        title: editedPicture.title,
        happenedAt: editedPicture.happenedAt.toISOString(),

        createdAt: editedPicture.createdAt.toISOString(),
        updatedAt: editedPicture.updatedAt.toISOString(),
      };
    }

    /* - Se não houver troca de imagem - */

    const editedPicture = await prisma.gallery.update({
      where: { id: parsedPicture.data.pictureId },
      data: { ...basePictureData },
    });

    return {
      id: editedPicture.id,
      userId: editedPicture.userId,
      eventId: editedPicture.eventId,
      image: editedPicture.image,
      title: editedPicture.title,
      happenedAt: editedPicture.happenedAt.toISOString(),

      createdAt: editedPicture.createdAt.toISOString(),
      updatedAt: editedPicture.updatedAt.toISOString(),
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

    if (error instanceof PrismaClientKnownRequestError && error.code === "P2003") {
      return "event_not_found";
    }

    return false;
  }
};

export { editGalleryPicture };
