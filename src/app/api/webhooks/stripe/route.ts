import { cancelUnpaidOrders } from "@/lib/payments/cancelUnpaidOrder";
import { markOrderAsPaid } from "@/lib/payments/markOrderAsPaid";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

// Se o cliente abriu uma sessão nova para o mesmo pedido, a antiga expirar não pode cancelá-lo

const hasOtherActiveSession = async (session: Stripe.Checkout.Session) => {
  const recent = await stripe.checkout.sessions.list({ limit: 100, created: { gte: Math.floor(Date.now() / 1000) - 60 * 60 * 48 } });

  return recent.data.some(
    (other) =>
      other.id !== session.id &&
      (other.status === "open" || other.payment_status === "paid") &&
      other.metadata?.ticketPaymentId === session.metadata?.ticketPaymentId &&
      other.metadata?.voucherPaymentId === session.metadata?.voucherPaymentId,
  );
};

export async function POST(request: Request) {
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
    const session = event.data.object as Stripe.Checkout.Session;
    const ticketPaymentId = session.metadata?.ticketPaymentId || undefined;
    const voucherPaymentId = session.metadata?.voucherPaymentId || undefined;

    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      // No Pix, o "completed" chega antes do dinheiro

      if (session.payment_status === "paid") {
        await markOrderAsPaid({ ticketPaymentId, voucherPaymentId });
      }
    }

    if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      if (!(await hasOtherActiveSession(session))) {
        await cancelUnpaidOrders({ ticketPaymentId, voucherPaymentId });
      }
    }
  } catch {
    return NextResponse.json({ error: "Falha ao processar" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
