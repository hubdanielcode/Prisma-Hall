import { z } from "zod";
import { createProductSchema } from "./createProductSchema";
import { atLeastOneFieldUpdated } from "../../../../shared/utils/atLeastOneFieldUpdated";

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
