import { cancelUnpaidOrders, getRealCardMethod, markOrderAsPaid, stripe } from "@/lib/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const runtime = "nodejs";
const maxSessionsToCheck = 500;

// Se o cliente abriu uma sessão nova para o mesmo pedido, o fato de a sessão antiga expirar não pode cancelar o pedido

const hasOtherActiveSession = async (endedSession: Stripe.Checkout.Session) => {
  let checkedSessions = 0;

  for await (const otherSession of stripe.checkout.sessions.list({
    limit: 500,
    created: { gte: Math.floor(Date.now() / 1000) - 60 * 60 * 48 },
  })) {
    const isSameOrder =
      otherSession.id !== endedSession.id &&
      otherSession.metadata?.ticketPaymentId === endedSession.metadata?.ticketPaymentId &&
      otherSession.metadata?.voucherPaymentId === endedSession.metadata?.voucherPaymentId;

    if (isSameOrder && (otherSession.status === "open" || otherSession.payment_status === "paid")) {
      return true;
    }

    checkedSessions += 1;

    if (checkedSessions >= maxSessionsToCheck) {
      break;
    }
  }

  return false;
};

const POST = async (request: Request) => {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  try {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const ticketPaymentId = checkoutSession.metadata?.ticketPaymentId || undefined;
    const voucherPaymentId = checkoutSession.metadata?.voucherPaymentId || undefined;

    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      // No Pix, o "completed" chega antes do dinheiro

      if (checkoutSession.payment_status === "paid") {
        // 1. Crédito ou débito reais, que o Stripe só informa depois do pagamento

        const stripeMethod = await getRealCardMethod(checkoutSession);

        // 2. Guarda a cobrança do Stripe no pagamento, para o reembolso encontrá-la direto depois

        const paymentIntentId =
          typeof checkoutSession.payment_intent === "string" ? checkoutSession.payment_intent : checkoutSession.payment_intent?.id;

        const orderMarkedAsPaid = await markOrderAsPaid({ ticketPaymentId, voucherPaymentId, stripeMethod, paymentIntentId });

        // 3. Se o banco falhou, responde erro para o Stripe reenviar o evento. O reenvio é seguro: pagamento que já saiu de "pendente" é ignorado

        if (!orderMarkedAsPaid) {
          return NextResponse.json({ error: "Falha ao confirmar o pagamento" }, { status: 500 });
        }
      }
    }

    if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      if (!(await hasOtherActiveSession(checkoutSession))) {
        const unpaidOrdersCancelled = await cancelUnpaidOrders({ ticketPaymentId, voucherPaymentId });

        /* - Mesma regra: se o cancelamento falhou, o Stripe precisa reenviar o evento - */

        if (!unpaidOrdersCancelled) {
          return NextResponse.json({ error: "Falha ao cancelar o pedido não pago" }, { status: 500 });
        }
      }
    }
  } catch {
    return NextResponse.json({ error: "Falha ao processar" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
};

export { POST };
