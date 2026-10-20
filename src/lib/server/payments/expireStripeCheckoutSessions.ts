import "server-only";
import { stripe } from "../services/stripe";

/* - Quantas sessões recentes do Stripe são varridas antes de desistir da listagem - */

const maxSessionToCheck = 500;

/* - Expira as sessões de checkout ainda abertas de um pagamento pendente, para ele não possa ser pago depois que o pedido já foi cancelado. - */

const expireStripeCheckoutSessions = async (paymentId: string, paymentCreatedAt: Date) => {
  try {
    const startSeconds = Math.floor(paymentCreatedAt.getTime() / 1000) - 300;

    let checkedSessions = 0;
    let foundPaymentSession = false;
    let reachedLimit = false;

    for await (const session of stripe.checkout.sessions.list({ created: { gte: startSeconds }, limit: 100 })) {
      checkedSessions += 1;

      const isPaymentSession = session.metadata?.ticketPaymentId === paymentId || session.metadata?.voucherPaymentId === paymentId;

      if (isPaymentSession) {
        foundPaymentSession = true;
      }

      if (isPaymentSession && session.status === "complete") {
        return false;
      }

      if (isPaymentSession && session.status === "open") {
        await stripe.checkout.sessions.expire(session.id);
      }

      if (checkedSessions >= maxSessionToCheck) {
        reachedLimit = true;
        break;
      }
    }

    /* - Se o limite estourou e a sessão do pagamento não apareceu, não dá para garantir que ela foi expirada. Devolve false para bloquear a operação em vez de arriscar o usuário pagar um pedido cancelado - */

    if (reachedLimit && !foundPaymentSession) {
      console.error(`Sessão do Stripe não encontrada nas ${maxSessionToCheck} mais recentes. Pagamento: ${paymentId}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Expiração das sessões do Stripe falhou. Pagamento: ${paymentId}`, error);
    return false;
  }
};

export { expireStripeCheckoutSessions };
