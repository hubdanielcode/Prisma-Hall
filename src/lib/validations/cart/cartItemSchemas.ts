import { z } from "zod";

const cartItemIdSchema = z.uuid();

const checkoutCartSchema = z.object({
  // 1. Forma de pagamento

  method: z.enum(["cash", "pix", "debitCard", "creditCard"]),
});

const cartItemSchema = z.object({
  // 1. ID do produto comprado

  productId: z.uuid().optional(),

  // 2. ID do evento comprado

  eventId: z.uuid().optional(),

  // 3. Tipo de item sendo vendido

  type: z.enum(["drinks", "tickets"]),

  // 4. Quantidade

  quantity: z.int().positive(),
});

export { cartItemIdSchema, checkoutCartSchema, cartItemSchema };
