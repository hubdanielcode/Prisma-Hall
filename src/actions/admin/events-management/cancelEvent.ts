"use server";

import { cancelEventIdSchema } from "@/lib/validations/admin/events-management/cancelEventSchema";
import { checkIsAdmin } from "../checkIsAdmin";
import { getEventStatus } from "@/lib/server/events/getEventStatus";
import { getUserIdsThatFavoritedEvent, notifyUsersByEmail } from "@/lib/server/notifications/notifyUsers";
import { prisma } from "@/lib/server/services/prisma";
import { serviceFee } from "@/features/cart/utils/serviceFee";
import { refundStripePayment } from "@/lib/server/payments/refundStripePayment";

/* - Cancela um evento que ainda vai acontecer: o evento continua no banco com status de cancelado - */

const cancelEvent = async (eventId: string) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedEventId = cancelEventIdSchema.safeParse(eventId);

  if (!parsedEventId.success) {
    return false;
  }

  try {
    const eventToCancel = await prisma.event.findUnique({ where: { id: parsedEventId.data } });

    if (!eventToCancel || getEventStatus(eventToCancel) !== "soon") {
      return false;
    }

    const usersToNotify = await getUserIdsThatFavoritedEvent(eventToCancel.id);

    await prisma.event.update({ where: { id: eventToCancel.id }, data: { status: "cancelled" } });

    /* - Uma falha no reembolso não desfaz o cancelamento - */

    try {
      await refundCancelledEventTicketPayments(eventToCancel.id, eventToCancel.title);
    } catch {
      // O evento continua cancelado mesmo sem o reembolso
    }

    /* - Uma falha no aviso não desfaz o cancelamento - */

    try {
      await notifyUsersByEmail(usersToNotify, {
        type: "event_update",
        title: "Evento cancelado",
        message: `${eventToCancel.title} foi cancelado.`,
      });
    } catch {
      // O evento continua cancelado mesmo sem o aviso
    }
  } catch {
    return false;
  }

  return true;
};

const refundCancelledEventTicketPayments = async (eventId: string, eventTitle: string) => {
  const ordersToRefund = await prisma.ticketOrder.findMany({
    where: { tickets: { some: { eventId: eventId, status: "active" } } },
    include: { tickets: true, ticketPayments: true },
  });

  for (const order of ordersToRefund) {
    try {
      /* - O pedido só é confirmado no momento do pagamento, então se o pagamento estiver pendente (status: "pending"), o pedido também estará. Dito isso, checando se o pagamento já foi concluído (e o pedido confirmado) para saber se é necessário fazer reembolso. - */

      const confirmedPayment = order.ticketPayments.filter((payment) => payment.status === "confirmed");

      if (confirmedPayment.length === 0) {
        /* - Pagamento não efetuado (status: "pending") - */

        await prisma.$transaction([
          // 1. Cancela o pedido

          prisma.ticketOrder.update({
            where: { id: order.id, status: "pending" },
            data: { status: "cancelled" },
          }),

          // 2. Cancela o pagamento para que o usuário não consiga concluir

          prisma.ticketPayment.update({
            where: { id: order.ticketPayments[0].id, status: "pending" },
            data: { status: "cancelled" },
          }),
        ]);

        continue;
      }

      /* - Pagamento já efetuado (status: "confirmed"), então precisa descobrir o valor do reembolso - */

      const paymentToRefund = confirmedPayment[0];

      const allTicketsToEvent = order.tickets.filter((ticket) => ticket.eventId === eventId && ticket.status === "active");
      const remainingTickets = order.tickets.filter((ticket) => ticket.eventId !== eventId && ticket.status === "active");

      const ticketsValue = allTicketsToEvent.reduce((accumulator, ticket) => accumulator + ticket.quantity * ticket.unitPrice.toNumber(), 0);
      const partialValueToRefund = Math.round(ticketsValue * (1 + serviceFee) * 100) / 100;

      /* - Se todos os ingressos do pedido eram para o evento cancelado, o reembolso é do pagamento inteiro. Senão, só do valor dos ingressos daquele evento (pedido com ingressos de outros eventos) - */

      const isFullRefund = remainingTickets.length === 0;
      const valueToRefund = isFullRefund ? paymentToRefund.totalValue.toNumber() : partialValueToRefund;

      /* - O reembolso no Stripe vem antes de qualquer alteração no banco: se falhar, o pedido continua como estava (pagamento confirmado) e nenhum aviso é enviado - */

      const refunded = await refundStripePayment({
        paymentId: paymentToRefund.id,
        type: "tickets",
        amount: isFullRefund ? undefined : partialValueToRefund,
        idempotencyKey: `refund-event-${eventId}-${paymentToRefund.id}`,
      });

      if (!refunded) {
        console.error(`Reembolso no Stripe falhou. Pedido: ${order.id}`);
        continue;
      }

      if (isFullRefund) {
        await prisma.$transaction([
          // 1. Cancela o pedido

          prisma.ticketOrder.update({
            where: { id: order.id, status: "confirmed" },
            data: { status: "cancelled" },
          }),

          // 2. Marca o pagamento como reembolsado

          prisma.ticketPayment.update({
            where: { id: paymentToRefund.id, status: "confirmed" },
            data: { status: "refunded" },
          }),

          // 3. Cancela os ingressos

          prisma.ticket.updateMany({
            where: { orderId: order.id, eventId: eventId, status: "active" },
            data: { status: "cancelled" },
          }),
        ]);
      } else {
        await prisma.ticket.updateMany({
          where: { orderId: order.id, eventId: eventId, status: "active" },
          data: { status: "cancelled" },
        });
      }

      await notifyUsersByEmail([order.userId], {
        type: "order_cancelled",
        title: "Pedido reembolsado",
        message: `O evento ${eventTitle} foi cancelado e R$ ${valueToRefund.toFixed(2)} serão reembolsados`,
      });
    } catch (error) {
      console.error(`Cancelamento do pedido falhou. Pedido: ${order.id}`, error);
    }
  }
};

export { cancelEvent };
