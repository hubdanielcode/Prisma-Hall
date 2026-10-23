"use server";

import { isReviewEditOpen } from "@/shared/utils/functions/reviewEditPolicy";
import { prisma, recalculateEventRating, recalculateUserBadges } from "@/lib/server";
import { updateReviewSchema } from "@/lib/validations/events/reviews/updateReviewSchema";
import { validateSession } from "../../authentication/validateSession";
import z from "zod";

const updateReview = async (review: z.infer<typeof updateReviewSchema>) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedReview = updateReviewSchema.safeParse(review);

  if (!parsedReview.success) {
    return false;
  }

  try {
    const existingReview = await prisma.review.findUnique({ where: { id: parsedReview.data.reviewId } });

    if (!existingReview || existingReview.userId !== validSession.user.id) {
      return false;
    }

    /* - A avaliação só pode ser editada nos primeiros minutos depois de criada (excluir continua liberado) - */

    if (!isReviewEditOpen(existingReview.createdAt)) {
      return "edit_window_expired";
    }

    const editedReview = await prisma.review.update({
      where: { id: existingReview.id },
      data: {
        rating: parsedReview.data.rating,
        comment: parsedReview.data.comment,
      },
      include: {
        event: { select: { title: true } },
        user: { select: { name: true, profilePicture: true, verifiedBadge: true } },
      },
    });

    /* - Editar o comentário pode fazer o usuário ganhar ou perder o selo de verificado - */

    const recalculatedBadges = await recalculateUserBadges(validSession.user.id);

    /* - Editar a nota muda a média do evento - */

    await recalculateEventRating(editedReview.eventId);

    return {
      id: editedReview.id,
      userId: editedReview.userId,
      eventId: editedReview.eventId,
      rating: editedReview.rating.toNumber(),
      comment: editedReview.comment,
      eventName: editedReview.event.title,
      userName: editedReview.user.name,
      userPhoto: editedReview.user.profilePicture,
      verifiedBadge: recalculatedBadges ? recalculatedBadges.verifiedBadge : editedReview.user.verifiedBadge,

      createdAt: editedReview.createdAt.toISOString(),
      updatedAt: editedReview.updatedAt.toISOString(),
    };
  } catch {
    return false;
  }
};

export { updateReview };
