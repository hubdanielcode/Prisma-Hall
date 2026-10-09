"use server";

import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";

const getEventPictures = async () => {
  /* - A galeria é pública: a sessão só serve para saber o que o usuário já curtiu - */

  const validSession = await validateSession();

  try {
    const pictures = await prisma.gallery.findMany({
      include: { event: { select: { tag: true } } },
      orderBy: { happenedAt: "desc" },
    });

    const pictureIds = pictures.map((picture) => picture.id);

    const likesByPicture = await prisma.galleryLikes.groupBy({
      by: ["imageId"],
      where: { imageId: { in: pictureIds } },
      _count: { _all: true },
    });

    const myLikes = validSession ? await prisma.galleryLikes.findMany({ where: { userId: validSession.user.id, imageId: { in: pictureIds } } }) : [];

    const likesCount = new Map(likesByPicture.map((like) => [like.imageId, like._count._all]));
    const likedPictures = new Set(myLikes.map((like) => like.imageId));

    return pictures.map((picture) => ({
      id: picture.id,
      userId: picture.userId,
      eventId: picture.eventId,
      image: picture.image,
      title: picture.title,
      tag: picture.event.tag,
      happenedAt: picture.happenedAt.toISOString(),
      likes: likesCount.get(picture.id) ?? 0,
      likedByMe: likedPictures.has(picture.id),

      createdAt: picture.createdAt.toISOString(),
      updatedAt: picture.updatedAt.toISOString(),
    }));
  } catch {
    throw new Error("Erro ao buscar fotos da galeria.");
  }
};

export { getEventPictures };
