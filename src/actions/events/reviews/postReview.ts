"use server";

import { createReviewSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
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

    return {
      id: newReview.id,
      userId: newReview.userId,
      eventId: newReview.eventId,
      rating: newReview.rating.toNumber(),
      comment: newReview.comment,
      eventName: newReview.event.title,
      userName: newReview.user.name,
      userPhoto: newReview.user.profilePicture,
      verifiedBadge: newReview.user.verifiedBadge,

      createdAt: newReview.createdAt.toISOString(),
      updatedAt: newReview.updatedAt.toISOString(),
    };
  } catch {
    return false;
  }
};

export { postReview };
