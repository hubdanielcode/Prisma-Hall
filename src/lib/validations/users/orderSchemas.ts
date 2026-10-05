import { z } from "zod";

const orderIdSchema = z.uuid();

const buyTicketsSchema = z.object({
  // 1. ID do evento

  eventId: z.uuid(),

  // 2. Quantidade

  quantity: z.int().min(1),

  // 3. Forma de pagamento

  method: z.enum(["cash", "pix", "debitCard", "creditCard"]),
});

const buyVouchersSchema = z.object({
  // 1. Itens do pedido

  items: z
    .array(
      z.object({
        // 1.1. ID do produto

        productId: z.uuid(),

        // 1.2. Quantidade

        quantity: z.int().min(1),
      }),
    )
    .min(1),

  // 2. Forma de pagamento

  method: z.enum(["cash", "pix", "debitCard", "creditCard"]),
});

export { orderIdSchema, buyTicketsSchema, buyVouchersSchema };
