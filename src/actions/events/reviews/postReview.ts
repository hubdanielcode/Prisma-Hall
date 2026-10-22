"use server";

import { createReviewSchema } from "@/lib/validations/events/createReviewSchema";
import { prisma, recalculateEventRating, recalculateUserBadges } from "@/lib/server";
import { PrismaClientKnownRequestError } from "@/prisma/generated/prisma/internal/prismaNamespace";
import { validateSession } from "../../authentication/validateSession";
import z from "zod";

const postReview = async (review: z.infer<typeof createReviewSchema>) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedReview = createReviewSchema.safeParse(review);

  if (!parsedReview.success) {
    return false;
  }

  try {
    /* - Somente usuários que participaram do evento podem escrever avaliação (ingresso ativo, pedido confirmado e evento já encerrado e não cancelado) - */

    const existingTicket = await prisma.ticket.findFirst({
      where: { userId: validSession.user.id, eventId: parsedReview.data.eventId, status: "active", order: { status: "confirmed" } },
      select: { id: true },
    });

    if (!existingTicket) {
      return false;
    }

    const eventAlreadyHappened = await prisma.event.findFirst({
      where: { id: parsedReview.data.eventId, isCancelled: false, startsAt: { lt: new Date() } },
      select: { id: true },
    });

    if (!eventAlreadyHappened) {
      return false;
    }

    const newReview = await prisma.review.create({
      data: {
        userId: validSession.user.id,
        eventId: parsedReview.data.eventId,
        rating: parsedReview.data.rating,
        comment: parsedReview.data.comment,
      },
      include: {
        event: { select: { title: true } },
        user: { select: { name: true, profilePicture: true, verifiedBadge: true } },
      },
    });

    /* - Recalcula os badges com a nova avaliação - */

    const recalculatedBadges = await recalculateUserBadges(validSession.user.id);

    /* - Recalcula a nota média do evento com a nova avaliação - */

    await recalculateEventRating(newReview.eventId);

    return {
      id: newReview.id,
      userId: newReview.userId,
      eventId: newReview.eventId,
      rating: newReview.rating.toNumber(),
      comment: newReview.comment,
      eventName: newReview.event.title,
      userName: newReview.user.name,
      userPhoto: newReview.user.profilePicture,
      verifiedBadge: recalculatedBadges ? recalculatedBadges.verifiedBadge : newReview.user.verifiedBadge,

      createdAt: newReview.createdAt.toISOString(),
      updatedAt: newReview.updatedAt.toISOString(),
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      const errorMeta = JSON.stringify(error.meta);

      if (errorMeta.includes("user_id")) {
        return "already_reviewed";
      }
    }

    return false;
  }
};

export { postReview };
