import { z } from "zod";
import { regex } from "@/shared";

const createReviewSchema = z.object({
  // 1. ID do evento sendo avaliado

  eventId: z.uuid(),

  // 2. Nota

  rating: z.int().min(1).max(5),

  // 3. Comentário

  comment: z
    .string()
    .regex(regex.reviewComment)
    .min(0)
    .max(150, "Seu comentário não deve ultrapassar um máximo de 150 caracteres.")
    .optional(),
});

export { createReviewSchema };
