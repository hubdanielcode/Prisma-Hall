"use server";

import { getAllReviewsSchema } from "@/lib/validations/events/reviews/getAllReviewsSchema";
import { prisma } from "@/lib/server/services/prisma";
import z from "zod";

const getAllReviews = async (allReviews: z.infer<typeof getAllReviewsSchema>) => {
  const parsedAllReviews = getAllReviewsSchema.safeParse(allReviews);

  if (!parsedAllReviews.success) {
    return false;
  }

  const currentPage = parsedAllReviews.data.currentPage;
  const itemsPerPage = parsedAllReviews.data.itemsPerPage;
  const eventId = parsedAllReviews.data.eventId;
  const userId = parsedAllReviews.data.userId;

  try {
    /* - Filtros aplicados no banco - */

    const where = {
      ...(eventId ? { eventId } : {}),
      ...(userId ? { userId } : {}),
    };

    /* - A média e o total saem do banco, para valerem para todas as avaliações do filtro e não só para a página - */

    const [reviewsAggregate, reviews] = await prisma.$transaction([
      prisma.review.aggregate({
        where,
        _avg: { rating: true },
        _count: true,
      }),
      prisma.review.findMany({
        where,
        include: {
          event: { select: { title: true } },
          user: { select: { name: true, profilePicture: true, verifiedBadge: true } },
        },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
      }),
    ]);

    const total = reviewsAggregate._count;

    return {
      reviews: reviews.map((review) => ({
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
      })),
      total,
      totalPages: Math.ceil(total / itemsPerPage),
      averageRating: reviewsAggregate._avg.rating ? reviewsAggregate._avg.rating.toNumber() : 0,
    };
  } catch {
    throw new Error("Erro ao buscar avaliações.");
  }
};

export { getAllReviews };
