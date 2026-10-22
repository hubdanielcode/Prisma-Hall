"use server";

import { prisma, recalculateEventRating, recalculateUserBadges } from "@/lib/server";
import { reviewIdSchema } from "@/lib/validations/events/reviewIdSchema";
import { validateSession } from "../../authentication/validateSession";

const deleteReview = async (reviewId: string) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedReviewId = reviewIdSchema.safeParse(reviewId);

  if (!parsedReviewId.success) {
    return false;
  }

  try {
    const existingReview = await prisma.review.findUnique({ where: { id: parsedReviewId.data } });

    if (!existingReview || existingReview.userId !== validSession.user.id) {
      return false;
    }

    await prisma.review.delete({ where: { id: existingReview.id } });

    /* - Excluir a avaliação pode fazer o usuário perder o selo de verificado - */

    await recalculateUserBadges(validSession.user.id);

    /* - Excluir a avaliação muda a média do evento (sem avaliações, volta para 0) - */

    await recalculateEventRating(existingReview.eventId);

    return true;
  } catch {
    return false;
  }
};

export { deleteReview };
