import z from "zod";
import { createAttractionSchema } from "./createAttractionSchema";
import { atLeastOneFieldUpdated } from "@/shared/utils";

const editAttractionSchema = createAttractionSchema
  .partial()
  .extend({ attractionId: z.uuid() })
  .refine(
    (attraction) => {
      const { attractionId, ...attractionWithoutId } = attraction;

      return atLeastOneFieldUpdated(attractionWithoutId);
    },

    { message: "Para validar a edição, altere pelo menos dos campos" },
  );

export { editAttractionSchema };
