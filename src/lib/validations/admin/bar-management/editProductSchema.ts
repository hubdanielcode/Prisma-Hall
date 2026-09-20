import { atLeastOneFieldUpdated } from "@/shared/utils/functions/atLeastOneFieldUpdated";
import { createProductSchema } from "./createProductSchema";
import { z } from "zod";

const editProductSchema = createProductSchema
  .partial()
  .extend({ productId: z.uuid() })
  .refine(
    (product) => {
      const { productId, ...productWithoutId } = product;

      return atLeastOneFieldUpdated(productWithoutId);
    },

    { message: "Para validar a edição, altere pelo menos um dos campos." },
  );

export { editProductSchema };
