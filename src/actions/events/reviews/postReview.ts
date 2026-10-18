"use server";

import { createReviewSchema } from "@/lib/validations/events/createReviewSchema";
import { prisma } from "@/lib/server/services/prisma";
import { recalculateUserBadges } from "@/lib/server/badges/achievementBadges";
import { validateSession } from "@/actions/session/validateSession";
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
    /* - Só avalia quem participou do evento (ingresso comprado e pedido confirmado) - */

    const existingTicket = await prisma.ticket.findFirst({
      where: { userId: validSession.user.id, eventId: parsedReview.data.eventId, order: { status: "confirmed" } },
      select: { id: true },
    });

    if (!existingTicket) {
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
  } catch {
    return false;
  }
};

export { postReview };
