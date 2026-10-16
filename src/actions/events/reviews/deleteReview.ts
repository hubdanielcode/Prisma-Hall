"use server";

import { prisma } from "@/lib/server/services/prisma";
import { recalculateUserBadges } from "@/lib/server/badges/achievementBadges";
import { validateSession } from "@/actions/session/validateSession";

const deleteReview = async (reviewId: string) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  try {
    const existingReview = await prisma.review.findUnique({ where: { id: reviewId } });

    if (!existingReview || existingReview.userId !== validSession.user.id) {
      return false;
    }

    await prisma.review.delete({ where: { id: existingReview.id } });

    /* - Excluir a avaliação pode fazer o usuário perder o selo de verificado - */

    await recalculateUserBadges(validSession.user.id);

    return true;
  } catch {
    return false;
  }
};

export { deleteReview };
