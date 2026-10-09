"use server";

import { prisma } from "@/lib/prisma";
import { updateReviewSchema } from "@/lib/validations";
import { validateSession } from "@/actions/session/validateSession";
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

    return {
      id: editedReview.id,
      userId: editedReview.userId,
      eventId: editedReview.eventId,
      rating: editedReview.rating.toNumber(),
      comment: editedReview.comment,
      eventName: editedReview.event.title,
      userName: editedReview.user.name,
      userPhoto: editedReview.user.profilePicture,
      verifiedBadge: editedReview.user.verifiedBadge,

      createdAt: editedReview.createdAt.toISOString(),
      updatedAt: editedReview.updatedAt.toISOString(),
    };
  } catch {
    return false;
  }
};

export { updateReview };
