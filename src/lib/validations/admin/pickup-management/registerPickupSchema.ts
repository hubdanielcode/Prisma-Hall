import { z } from "zod";

const registerPickupSchema = z.object({
  // 1. Pedido que está sendo retirado

  orderId: z.uuid(),

  // 2. Tipo do pedido

  type: z.enum(["tickets", "vouchers"]),
});

export { registerPickupSchema };
