import { z } from "zod";

const buyTicketsSchema = z.object({
  // 1. ID do evento

  eventId: z.uuid(),

  // 2. Quantidade

  quantity: z.int().min(1),

  // 3. Forma de pagamento

  method: z.enum(["cash", "pix", "debitCard", "creditCard"]),
});

export { buyTicketsSchema };
