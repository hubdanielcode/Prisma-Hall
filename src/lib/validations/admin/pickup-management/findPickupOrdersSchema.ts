import { z } from "zod";

const findPickupOrdersSchema = z.object({
  // 1. Código do pedido (início do código) ou nome/e-mail do cliente

  query: z.string().trim().min(3).max(100),

  // 2. Tipo do pedido

  type: z.enum(["tickets", "vouchers"]),
});

export { findPickupOrdersSchema };
