import { atLeastOneFieldUpdated } from "@/shared/utils/functions/atLeastOneFieldUpdated";
import { cartItemIdSchema, cartItemSchema } from "./cartItemSchemas";

const updateCartItemSchema = cartItemSchema
  .partial()
  .omit({ productId: true, eventId: true, type: true })
  .extend({ cartItemId: cartItemIdSchema })
  .refine(
    (cartItem) => {
      const { cartItemId, ...cartItemWithoutId } = cartItem;

      return atLeastOneFieldUpdated(cartItemWithoutId);
    },

    { message: "Para validar a edição, altere pelo menos um dos campos." },
  );

export { updateCartItemSchema };
