import { atLeastOneFieldUpdated } from "@/shared/utils/functions/atLeastOneFieldUpdated";
import { createAttractionSchema } from "./createAttractionSchema";
import { z } from "zod";

const editAttractionSchema = createAttractionSchema
  .partial()
  .extend({ attractionId: z.uuid() })
  .refine(
    (attraction) => {
      const { attractionId, ...attractionWithoutId } = attraction;

      return atLeastOneFieldUpdated(attractionWithoutId);
    },

    { message: "Para validar a edição, altere pelo menos um dos campos." },
  );

export { editAttractionSchema };
