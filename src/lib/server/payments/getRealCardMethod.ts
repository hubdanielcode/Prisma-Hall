import "server-only";
import { stripe } from "@/lib/server/services/stripe";
import type { PaymentMethod } from "@/prisma/generated/prisma/enums";
import type Stripe from "stripe";

/* - Tipo real do cartão usado no pagamento. O Stripe não separa crédito de débito na sessão, então o cliente pode pagar com um tipo diferente do escolhido - */

const getRealCardMethod = async (checkoutSession: Stripe.Checkout.Session): Promise<PaymentMethod | undefined> => {
  // 1. Só consulta o Stripe se a sessão foi travada em cartão. Pix não tem cartão

  if (!checkoutSession.allowed_payment_method_types?.includes("card")) {
    return undefined;
  }

  try {
    const paymentIntentId = typeof checkoutSession.payment_intent === "string" ? checkoutSession.payment_intent : checkoutSession.payment_intent?.id;

    if (!paymentIntentId) {
      return undefined;
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge"] });
    const charge = paymentIntent.latest_charge;

    if (!charge || typeof charge === "string") {
      return undefined;
    }

    // 2. Pré-pago e desconhecido ficam de fora: nesses casos vale o que o cliente escolheu

    const funding = charge.payment_method_details?.card?.funding;

    if (funding === "credit") {
      return "creditCard";
    }

    if (funding === "debit") {
      return "debitCard";
    }

    return undefined;
  } catch {
    // Sem a consulta, o pagamento segue com o método escolhido no checkout

    return undefined;
  }
};

export { getRealCardMethod };
