"use server";

import { expireStripeCheckoutSessions, notifyUsersByEmail, prisma, recalculateUserBadges, refundStripePayment, retryOnFailure } from "@/lib/server";
import { isTicketCancellationOpen } from "@/shared/utils/functions/cancellationPolicy";
import { orderIdSchema } from "@/lib/validations/users/orderIdSchema";
import { validateSession } from "../../session/validateSession";

const cancelTicketOrder = async (orderId: string) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedOrderId = orderIdSchema.safeParse(orderId);

  if (!parsedOrderId.success) {
    return false;
  }

  try {
    const order = await prisma.ticketOrder.findUnique({
      where: { id: parsedOrderId.data },
      include: { tickets: { include: { event: true } }, ticketPayments: true },
    });

    if (!order || order.userId !== validSession.user.id) {
      return false;
    }

    /* - Pedido já cancelado não pode ser cancelado de novo - */

    if (order.status === "cancelled") {
      return false;
    }

    /* - Pedido com ingresso de evento que já aconteceu, ou fora do prazo de cancelamento, não pode mais ser cancelado. Evento cancelado pela casa não tem prazo - */

    if (order.tickets.some((ticket) => !ticket.event.isCancelled && !isTicketCancellationOpen(ticket.event.startsAt))) {
      return false;
    }

    /* - Pedido com retirada registrada não pode mais ser cancelado - */

    if (order.ticketPayments.some((payment) => payment.pickedUpAt)) {
      return false;
    }

    /* - Pagamento pendente no Stripe: as sessões de checkout abertas são expiradas ANTES de qualquer alteração, para o pedido cancelado não poder mais ser pago. Se uma sessão já foi paga, o pagamento está entrando e o cancelamento espera ele ser confirmado - */

    const pendingStripePayments = order.ticketPayments.filter((payment) => payment.status === "pending" && payment.method !== "cash");

    for (const payment of pendingStripePayments) {
      const expiredSessions = await expireStripeCheckoutSessions(payment.id, payment.createdAt);

      if (!expiredSessions) {
        return false;
      }
    }

    /* - O reembolso no Stripe acontece com pagamentos que ainda estão marcados como "confirmed". Se falhar, o pedido continua como estava e o usuário pode tentar novamente - */

    const confirmedPayment = order.ticketPayments.filter((payment) => payment.status === "confirmed");

    for (const payment of confirmedPayment) {
      const refundedPayment = await refundStripePayment({ paymentId: payment.id, type: "tickets" });

      if (!refundedPayment) {
        return false;
      }
    }

    /* - O dinheiro já voltou, então o banco precisa refletir isso. A transaction é repetida se falhar e, se ainda assim não der, repetir o cancelamento conclui a operação: o reembolso é idempotente - */

    try {
      await retryOnFailure(() =>
        prisma.$transaction(async (transaction) => {
          // 1. Pagamentos primeiro, na mesma ordem do cancelUnpaidOrders, para o webhook e o cancelamento do usuário não travarem um ao outro

          await transaction.ticketPayment.updateMany({ where: { orderId: order.id, status: "confirmed" }, data: { status: "refunded" } });
          await transaction.ticketPayment.updateMany({ where: { orderId: order.id, status: "pending" }, data: { status: "cancelled" } });

          // 2. Só cancela se o pedido ainda não estiver cancelado (protege contra duas chamadas ao mesmo tempo)

          const cancelledOrder = await transaction.ticketOrder.updateMany({
            where: { id: order.id, status: { not: "cancelled" } },
            data: { status: "cancelled" },
          });

          if (cancelledOrder.count === 0) {
            return;
          }

          // 3. Os ingressos do pedido cancelado também saem de "active", senão ele seria reprocessado (ex: no cancelEvent)

          await transaction.ticket.updateMany({ where: { orderId: order.id, status: "active" }, data: { status: "cancelled" } });
        }),
      );
    } catch (error) {
      if (confirmedPayment.length > 0) {
        console.error(
          `Reembolso feito no Stripe, mas o pedido ${order.id} não foi cancelado no banco. Repetir o cancelamento conclui a operação.`,
          error,
        );
      }

      throw error;
    }

    /* - O pedido já está cancelado. O que vem abaixo são consequências, e uma falha nelas não pode fazer a ação devolver erro - */

    // 1. Um evento a menos participado pode baixar o badge de frequência

    try {
      await recalculateUserBadges(validSession.user.id);
    } catch (error) {
      console.error(`Falha ao recalcular os badges do usuário ${validSession.user.id}`, error);
    }

    // 2. Avisa ao usuário que o pedido foi cancelado

    try {
      const eventTitle = order.tickets[0] ? order.tickets[0].event.title : "";

      await notifyUsersByEmail([validSession.user.id], {
        type: "order_cancelled",
        title: "Pedido cancelado",
        message: `O seu pedido #${order.id.slice(0, 8).toUpperCase()}${eventTitle ? ` (${eventTitle})` : ""} foi cancelado.`,
      });
    } catch (error) {
      console.error(`Falha ao notificar o cancelamento do pedido ${order.id}`, error);
    }

    return true;
  } catch {
    return false;
  }
};

export { cancelTicketOrder };
