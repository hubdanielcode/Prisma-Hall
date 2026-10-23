"use server";

import { checkIsAdmin } from "../../checkIsAdmin";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/server/services/prisma";
import z from "zod";

const deleteGalleryPicture = async (pictureId: string) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedPictureId = z.uuid().safeParse(pictureId);

  if (!parsedPictureId.success) {
    return false;
  }

  try {
    const pictureToDelete = await prisma.gallery.findUnique({ where: { id: parsedPictureId.data }, select: { image: true } });

    if (!pictureToDelete) {
      return false;
    }

    /* - As curtidas da foto são apagadas junto com ela (onDelete: Cascade no schema) - */

    await prisma.gallery.delete({ where: { id: parsedPictureId.data } });

    /* - A imagem só é removida do Blob depois que a foto foi excluída. Uma falha na remoção não desfaz a exclusão - */

    try {
      await del(pictureToDelete.image);
    } catch {
      // A foto continua excluída mesmo sem a remoção da imagem
    }

    return true;
  } catch {
    return false;
  }
};

export { deleteGalleryPicture };
