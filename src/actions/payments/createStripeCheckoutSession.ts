"use server";

import { prisma, stripe } from "@/lib/server";
import { stripeCheckoutSchema } from "@/lib/validations/cart/stripeCheckoutSchema";
import { validateSession } from "../session/validateSession";
import type { PaymentMethod } from "@/prisma/generated/prisma/enums";
import type Stripe from "stripe";
import z from "zod";

const stripePaymentMethodTypes: Partial<Record<PaymentMethod, Stripe.Checkout.SessionCreateParams.AllowedPaymentMethodType>> = {
  pix: "pix",
  creditCard: "card",
  debitCard: "card",
};

const createStripeCheckoutSession = async (payments: z.infer<typeof stripeCheckoutSchema>) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedPayments = stripeCheckoutSchema.safeParse(payments);

  if (!parsedPayments.success) {
    return false;
  }

  const ticketPaymentId = parsedPayments.data.ticketPaymentId;
  const voucherPaymentId = parsedPayments.data.voucherPaymentId;

  try {
    /* - Pagamentos do usuário - */

    const [existingTicketPayment, existingVoucherPayment] = await Promise.all([
      ticketPaymentId ? prisma.ticketPayment.findUnique({ where: { id: ticketPaymentId } }) : null,
      voucherPaymentId ? prisma.voucherPayment.findUnique({ where: { id: voucherPaymentId } }) : null,
    ]);

    // 1. Só segue com o que é do usuário e ainda está pendente. Pagamento em dinheiro não passa pelo Stripe, ele é confirmado de outra forma

    const ticketPayment =
      existingTicketPayment &&
      existingTicketPayment.userId === validSession.user.id &&
      existingTicketPayment.status === "pending" &&
      existingTicketPayment.method !== "cash"
        ? existingTicketPayment
        : null;

    const voucherPayment =
      existingVoucherPayment &&
      existingVoucherPayment.userId === validSession.user.id &&
      existingVoucherPayment.status === "pending" &&
      existingVoucherPayment.method !== "cash"
        ? existingVoucherPayment
        : null;

    /* - Itens da cobrança - */

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // 1. Pagamento dos ingressos

    if (ticketPayment) {
      lineItems.push({
        quantity: 1,

        price_data: {
          currency: "brl",
          unit_amount: Math.round(ticketPayment.totalValue.toNumber() * 100),
          product_data: { name: "Ingressos" },
        },
      });
    }

    // 2. Pagamento dos vouchers

    if (voucherPayment) {
      lineItems.push({
        quantity: 1,

        price_data: {
          currency: "brl",
          unit_amount: Math.round(voucherPayment.totalValue.toNumber() * 100),
          product_data: { name: "Pedidos" },
        },
      });
    }

    if (lineItems.length === 0) {
      return false;
    }

    // 1. A sessão só aceita o método escolhido no checkout, fazendo com que o método salvo no pagamento bata com o que, de fato, foi cobrado

    const paymentMethodTypes = new Set<Stripe.Checkout.SessionCreateParams.AllowedPaymentMethodType>();

    for (const payment of [ticketPayment, voucherPayment]) {
      const paymentMethodType = payment ? stripePaymentMethodTypes[payment.method] : undefined;

      if (paymentMethodType) {
        paymentMethodTypes.add(paymentMethodType);
      }
    }

    const returnPath = ticketPayment ? `/pedidos/${ticketPayment.orderId}` : `/pedidos/${voucherPayment?.orderId}`;

    const metadata = {
      ticketPaymentId: ticketPayment ? ticketPayment.id : "",
      voucherPaymentId: voucherPayment ? voucherPayment.id : "",
    };

    /* - Criando a sessão de pagamento - */

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: validSession.user.email,
      line_items: lineItems,
      allowed_payment_method_types: Array.from(paymentMethodTypes),
      success_url: `${appUrl}${returnPath}`,
      cancel_url: `${appUrl}${returnPath}`,

      // 1. A sessão expira em 1 hora (o Stripe trabalha com segundos)

      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,

      metadata,
      payment_intent_data: { metadata },
    });

    return stripeCheckoutSession.url ?? false;
  } catch {
    return false;
  }
};

export { createStripeCheckoutSession };
