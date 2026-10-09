import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

interface RefundStripePaymentProps {
  paymentId: string;
  type: "tickets" | "drinks";
}

/* - Só deve ser chamada depois que o pagamento já foi marcado como "refunded" no banco. Pagamentos sem cobrança no Stripe (ex: dinheiro) são ignorados - */

const refundStripePayment = async ({ paymentId, type }: RefundStripePaymentProps) => {
  try {
    /* - Pagamento reembolsado no banco - */

    const existingPayment =
      type === "tickets"
        ? await prisma.ticketPayment.findUnique({ where: { id: paymentId } })
        : await prisma.voucherPayment.findUnique({ where: { id: paymentId } });

    if (!existingPayment || existingPayment.status !== "refunded") {
      return false;
    }

    /* - Cobrança correspondente no Stripe - */

    const metadataKey = type === "tickets" ? "ticketPaymentId" : "voucherPaymentId";

    const foundPaymentIntents = await stripe.paymentIntents.search({ query: `metadata['${metadataKey}']:'${paymentId}' AND status:'succeeded'` });
    const paymentIntent = foundPaymentIntents.data[0];

    if (!paymentIntent) {
      return false;
    }

    /* - Reembolso - */

    await stripe.refunds.create({
      payment_intent: paymentIntent.id,
      amount: Math.round(existingPayment.totalValue.toNumber() * 100),
    });

    return true;
  } catch {
    return false;
  }
};

export { refundStripePayment };
