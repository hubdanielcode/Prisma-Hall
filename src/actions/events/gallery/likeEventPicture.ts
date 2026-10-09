"use server";

import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";

const likeEventPicture = async (pictureId: string) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  try {
    const picture = await prisma.gallery.findUnique({ where: { id: pictureId } });

    if (!picture) {
      return false;
    }

    const existingLike = await prisma.galleryLikes.findUnique({
      where: { userId_imageId: { userId: validSession.user.id, imageId: picture.id } },
    });

    /* - Se o usuário já curtiu, o clique remove a curtida - */

    if (existingLike) {
      await prisma.galleryLikes.delete({
        where: { userId_imageId: { userId: validSession.user.id, imageId: picture.id } },
      });

      return { pictureId: picture.id, liked: false };
    }

    await prisma.galleryLikes.create({ data: { userId: validSession.user.id, imageId: picture.id } });

    return { pictureId: picture.id, liked: true };
  } catch {
    return false;
  }
};

export { likeEventPicture };
