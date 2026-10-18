import "server-only";
import { prisma } from "@/lib/server/services/prisma";
import { stripe } from "@/lib/server/services/stripe";

type PaymentType = "tickets" | "drinks";

interface RefundStripePaymentProps {
  paymentId: string;
  type: PaymentType;
  amount?: number;
  idempotencyKey?: string;
}

/* - Quantas sessões recentes do Stripe são varridas antes de desistir da listagem e cair na busca - */

const maxSessionToCheck = 500;

/* - Localiza o payment intent da cobrança. A listagem de sessões é consistente (acha pagamentos recém-feitos); a busca do Stripe tem atraso de indexação e fica só como alternativa - */

const findPaymentIntentId = async (paymentId: string, type: PaymentType, paymentCreatedAt: Date) => {
  const metadataKey = type === "tickets" ? "ticketPaymentId" : "voucherPaymentId";

  /* - A sessão de checkout só pode ter sido criada depois do registro do pagamento, então a listagem começa um pouco antes dele - */

  const startSeconds = Math.floor(paymentCreatedAt.getTime() / 1000) - 300;

  let checkedSessions = 0;

  for await (const session of stripe.checkout.sessions.list({ created: { gte: startSeconds }, limit: 100 })) {
    checkedSessions += 1;

    if (session.metadata?.[metadataKey] === paymentId && session.status === "complete" && session.payment_intent) {
      return typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id;
    }

    if (checkedSessions >= maxSessionToCheck) {
      break;
    }
  }

  const foundPaymentIntents = await stripe.paymentIntents.search({ query: `metadata['${metadataKey}']:'${paymentId}' AND status:'succeeded'` });

  return foundPaymentIntents.data[0] ? foundPaymentIntents.data[0].id : null;
};

/* - Quanto ainda pode ser reembolsado da cobrança, em centavos (desconta reembolsos parciais já feitos). Devolve null se não der para saber - */

const getRemainingRefundableCents = async (paymentIntentId: string) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge"] });
  const charge = paymentIntent.latest_charge;

  if (!charge || typeof charge === "string") {
    return null;
  }

  return charge.amount - charge.amount_refunded;
};

const isAlreadyRefundedError = (error: unknown) => {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "charge_already_refunded";
};

/* - Reembolsa no Stripe um pagamento que ainda está "confirmed" no banco. Quem chama só deve marcar o pagamento como "refunded" DEPOIS QUE ESTA FUNÇÃO DEVOLVER TRUE: se o Stripe falhar, devolve false e nada deve ser alterado. Sem "amount" o reembolso é do que ainda resta na cobrança (total, ou o que sobrou depois de reembolsos parciais); com "amount" é parcial e o pagamento continua "confirmed". Pagamentos sem cobrança no Stripe (ex: dinheiro) contam como reembolsados. A chave de idempotência evita reembolso duplicado se a chamada for repetida - */

const refundStripePayment = async ({ paymentId, type, amount, idempotencyKey }: RefundStripePaymentProps) => {
  try {
    const existingPayment =
      type === "tickets"
        ? await prisma.ticketPayment.findUnique({ where: { id: paymentId } })
        : await prisma.voucherPayment.findUnique({ where: { id: paymentId } });

    if (!existingPayment || existingPayment.status !== "confirmed") {
      return false;
    }

    const totalValue = existingPayment.totalValue.toNumber();
    const valueToRefund = amount ?? totalValue;

    if (amount === undefined && totalValue <= 0) {
      return true;
    }

    if (valueToRefund <= 0 || valueToRefund > totalValue) {
      return false;
    }

    if (existingPayment.method === "cash") {
      return true;
    }

    const paymentIntentId = await findPaymentIntentId(paymentId, type, existingPayment.createdAt);

    if (!paymentIntentId) {
      console.error(`Cobrança não encontrada no Stripe. Pagamento: ${paymentId}`);
      return false;
    }

    let centsToRefund = Math.round(valueToRefund * 100);

    /* - Reembolso total: devolve só o que ainda resta (um reembolso parcial anterior, como o de evento cancelado, já saiu da cobrança) - */

    if (amount === undefined) {
      const remainingCents = await getRemainingRefundableCents(paymentIntentId);

      if (remainingCents !== null) {
        if (remainingCents <= 0) {
          return true;
        }

        centsToRefund = Math.min(centsToRefund, remainingCents);
      }
    }

    /* - O valor entra na chave para que uma repetição com outro valor restante não conflite com a tentativa anterior - */

    const finalIdempotencyKey = idempotencyKey ?? (amount === undefined ? `refund-${type}-${paymentId}-${centsToRefund}` : undefined);

    await stripe.refunds.create(
      {
        payment_intent: paymentIntentId,
        amount: centsToRefund,
      },
      finalIdempotencyKey ? { idempotencyKey: finalIdempotencyKey } : undefined,
    );

    return true;
  } catch (error) {
    /* - Se uma tentativa anterior já reembolsou tudo no Stripe mas o banco não chegou a atualizar, a nova tentativa segue em frente - */

    if (amount === undefined && isAlreadyRefundedError(error)) {
      return true;
    }

    console.error(`Reembolso no Stripe falhou. Pagamento: ${paymentId}`, error);
    return false;
  }
};

export { refundStripePayment };
