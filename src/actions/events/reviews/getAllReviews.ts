"use server";

import { prisma } from "@/lib/prisma";

const getAllReviews = async () => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        event: { select: { title: true } },
        user: { select: { name: true, profilePicture: true, verifiedBadge: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return reviews.map((review) => ({
      id: review.id,
      userId: review.userId,
      eventId: review.eventId,
      rating: review.rating.toNumber(),
      comment: review.comment,
      eventName: review.event.title,
      userName: review.user.name,
      userPhoto: review.user.profilePicture,
      verifiedBadge: review.user.verifiedBadge,

      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    }));
  } catch {
    throw new Error("Erro ao buscar avaliações.");
  }
};

export { getAllReviews };
