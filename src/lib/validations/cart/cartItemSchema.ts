import { z } from "zod";

const cartItemSchema = z
  .object({
    // 1. ID do produto comprado

    productId: z.uuid().optional(),

    // 2. ID do evento comprado

    eventId: z.uuid().optional(),

    // 3. Tipo de item sendo vendido

    type: z.enum(["drinks", "tickets"]),

    // 4. Quantidade

    quantity: z.int().positive(),
  })
  .refine(
    ({ productId, eventId }) => {
      if (
        (productId === undefined && eventId !== undefined) ||
        (productId !== undefined && eventId === undefined)
      ) {
        return true;
      } else {
        return false;
      }
    },

    { message: "Selecione um ingresso ou uma bebida, não os dois." },
  );

export { cartItemSchema };
