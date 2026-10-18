"use server";

import { cancelEventIdSchema } from "@/lib/validations/admin/events-management/cancelEventSchema";
import { checkIsAdmin } from "../checkIsAdmin";
import { getEventStatus } from "@/lib/server/events/getEventStatus";
import { getUserIdsThatFavoritedEvent, notifyUsersByEmail } from "@/lib/server/notifications/notifyUsers";
import { prisma } from "@/lib/server/services/prisma";
import { refundStripePayment } from "@/lib/server/payments/refundStripePayment";
import { serviceFee } from "@/features/cart/utils/serviceFee";

/* - Cancela um evento que ainda vai acontecer: o evento continua no banco com status de cancelado. Se o evento já está cancelado, só reprocessa os reembolsos que faltam (útil quando o Stripe falhou antes). Devolve quantos pedidos ainda estão sem reembolso - */

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

    if (!eventToCancel) {
      return false;
    }

    const eventStatus = getEventStatus(eventToCancel);

    /* - Evento que já aconteceu não pode ser cancelado. Evento já cancelado só reprocessa os reembolsos - */

    if (eventStatus === "happened") {
      return false;
    }

    const isRetry = eventStatus === "cancelled";

    if (!isRetry) {
      const usersToNotify = await getUserIdsThatFavoritedEvent(eventToCancel.id);

      await prisma.event.update({ where: { id: eventToCancel.id }, data: { isCancelled: true } });

      /* - Uma falha no aviso não desfaz o cancelamento - */

      try {
        await notifyUsersByEmail(usersToNotify, {
          type: "event_update",
          title: "Evento cancelado",
          message: `${eventToCancel.title} foi cancelado.`,
        });
      } catch (error) {
        console.error("[cancelEvent] Falha ao avisar os favoritos:", error);
      }
    }

    /* - Uma falha no reembolso não desfaz o cancelamento - */

    let pendingRefunds = 0;

    try {
      pendingRefunds = await refundCancelledEventTicketPayments(eventToCancel.id, eventToCancel.title);
    } catch (error) {
      console.error("[cancelEvent] Falha ao processar os reembolsos:", error);
      pendingRefunds = -1;
    }

    return { pendingRefunds };
  } catch {
    return false;
  }
};

/* - Devolve quantos pedidos não puderam ser reembolsados (podem ser reprocessados chamando o cancelEvent de novo) - */

const refundCancelledEventTicketPayments = async (eventId: string, eventTitle: string) => {
  /* - Pedido já cancelado (ex: pelo próprio usuário) não entra: os ingressos dele podem continuar "active" - */

  const ordersToRefund = await prisma.ticketOrder.findMany({
    where: { status: { not: "cancelled" }, tickets: { some: { eventId: eventId, status: "active" } } },
    include: { tickets: true, ticketPayments: true },
  });

  let failedOrders = 0;

  for (const order of ordersToRefund) {
    try {
      /* - O pedido só é confirmado no momento do pagamento, então se o pagamento estiver pendente (status: "pending"), o pedido também estará. Dito isso, checando se o pagamento já foi concluído (e o pedido confirmado) para saber se é necessário fazer reembolso. - */

      const confirmedPayment = order.ticketPayments.filter((payment) => payment.status === "confirmed");

      if (confirmedPayment.length === 0) {
        /* - Pagamento não efetuado (status: "pending") - */

        await prisma.$transaction([
          // 1. Cancela o pedido

          prisma.ticketOrder.updateMany({
            where: { id: order.id, status: "pending" },
            data: { status: "cancelled" },
          }),

          // 2. Cancela o pagamento para que o usuário não consiga concluir

          prisma.ticketPayment.updateMany({
            where: { orderId: order.id, status: "pending" },
            data: { status: "cancelled" },
          }),

          // 3. Cancela os ingressos para o pedido não ser reprocessado

          prisma.ticket.updateMany({
            where: { orderId: order.id, status: "active" },
            data: { status: "cancelled" },
          }),
        ]);

        continue;
      }

      /* - Pagamento já efetuado (status: "confirmed"), então precisa descobrir o valor do reembolso - */

      const paymentToRefund = confirmedPayment[0];

      const allTicketsWereToEvent = order.tickets.filter((ticket) => ticket.eventId === eventId && ticket.status === "active");
      const ticketsToOtherEvents = order.tickets.filter((ticket) => ticket.eventId !== eventId && ticket.status === "active");

      const ticketsValue = allTicketsWereToEvent.reduce((accumulator, ticket) => accumulator + ticket.quantity * ticket.unitPrice.toNumber(), 0);
      const partialValueToRefund = Math.round(ticketsValue * (1 + serviceFee) * 100) / 100;

      /* - Se todos os ingressos do pedido eram para o evento cancelado, o reembolso é do pagamento inteiro. Caso contrário, só do valor dos ingressos daquele evento - */

      const isFullRefund = ticketsToOtherEvents.length === 0;
      const valueToRefund = isFullRefund ? paymentToRefund.totalValue.toNumber() : partialValueToRefund;

      /* - O reembolso no Stripe vem antes de qualquer alteração no banco: se falhar, o pedido continua como estava (pagamento confirmado) e nenhum aviso é enviado - */

      const successfullyRefunded = await refundStripePayment({
        paymentId: paymentToRefund.id,
        type: "tickets",
        amount: isFullRefund ? undefined : partialValueToRefund,
        idempotencyKey: `refund-event-${eventId}-${paymentToRefund.id}`,
      });

      if (!successfullyRefunded) {
        console.error(`Reembolso no Stripe falhou. Pedido: ${order.id}`);
        failedOrders += 1;
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
        /* - Reembolso parcial: o pagamento continua "confirmed" porque ainda cobre os ingressos dos outros eventos. O refundStripePayment desconta o que já foi devolvido se o pedido inteiro for cancelado depois - */

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
      failedOrders += 1;
      console.error(`Cancelamento do pedido falhou. Pedido: ${order.id}`, error);
    }
  }

  return failedOrders;
};

export { cancelEvent };
