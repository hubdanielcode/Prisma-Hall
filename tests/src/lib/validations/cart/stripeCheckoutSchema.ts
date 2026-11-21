import { z } from "zod";

const stripeCheckoutSchema = z.object({
  // 1. ID do pagamento dos ingressos

  ticketPaymentId: z.uuid().optional(),

  // 2. ID do pagamento dos vouchers

  voucherPaymentId: z.uuid().optional(),
});

export { stripeCheckoutSchema };
