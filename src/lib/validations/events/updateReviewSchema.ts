import { z } from "zod";

import { createReviewSchema } from "./createReviewSchema";
import { atLeastOneFieldUpdated } from "../../../shared/utils/atLeastOneFieldUpdated";

const updateReviewSchema = createReviewSchema
  .partial()
  .omit({ eventId: true })
  .extend({ reviewId: z.uuid() })
  .refine(
    (review) => {
      const { reviewId, ...reviewWithoutId } = review;

      return atLeastOneFieldUpdated(reviewWithoutId);
    },

    { message: "Para validar a edição, altere pelo menos um dos campos." },
  );

export { updateReviewSchema };
{
}
