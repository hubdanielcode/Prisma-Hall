"use server";

import { prisma, recalculateUserBadges } from "@/lib/server";
import { validateSession } from "../../session/validateSession";

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
