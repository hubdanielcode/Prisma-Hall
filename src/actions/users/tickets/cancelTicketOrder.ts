"use server";

import { getEventStatus } from "@/lib/server/events/getEventStatus";
import { notifyUsersByEmail } from "@/lib/server/notifications/notifyUsers";
import { orderIdSchema } from "@/lib/validations/users/orderSchemas";
import { prisma } from "@/lib/server/services/prisma";
import { recalculateUserBadges } from "@/lib/server/badges/achievementBadges";
import { refundStripePayment } from "@/lib/server/payments/refundStripePayment";
import { validateSession } from "@/actions/session/validateSession";

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

    /* - Pedido com ingresso de evento que já aconteceu não pode mais ser cancelado - */

    if (order.tickets.some((ticket) => getEventStatus(ticket.event) === "happened")) {
      return false;
    }

    /* - Pedido com retirada registrada não pode mais ser cancelado - */

    if (order.ticketPayments.some((payment) => payment.pickedUpAt)) {
      return false;
    }

    /* - O reembolso no Stripe acontece com pagamentos que ainda estão marcados como "confirmed". Se falhar, o pedido continua como estava e o usuário pode tentar novamente - */

    const confirmedPayment = order.ticketPayments.filter((payment) => payment.status === "confirmed");

    for (const payment of confirmedPayment) {
      const refundedPayment = await refundStripePayment({ paymentId: payment.id, type: "tickets" });

      if (!refundedPayment) {
        return false;
      }
    }

    /* - Só cancela se o pedido ainda não estiver cancelado (protege contra duas chamadas ao mesmo tempo) - */

    await prisma.$transaction(async (transaction) => {
      const cancelledOrder = await transaction.ticketOrder.updateMany({
        where: { id: order.id, status: { not: "cancelled" } },
        data: { status: "cancelled" },
      });

      if (cancelledOrder.count === 0) {
        throw new Error("Pedido já cancelado");
      }

      await transaction.ticketPayment.updateMany({ where: { orderId: order.id, status: "confirmed" }, data: { status: "refunded" } });
      await transaction.ticketPayment.updateMany({ where: { orderId: order.id, status: "pending" }, data: { status: "failed" } });
    });

    /* - Um evento a menos participado pode baixar o badge de frequência - */

    await recalculateUserBadges(validSession.user.id);

    /* - Avisa ao usuário que o pedido foi cancelado - */

    const eventTitle = order.tickets[0] ? order.tickets[0].event.title : "";

    await notifyUsersByEmail([validSession.user.id], {
      type: "order_cancelled",
      title: "Pedido cancelado",
      message: `O seu pedido #${order.id.slice(0, 8).toUpperCase()}${eventTitle ? ` (${eventTitle})` : ""} foi cancelado.`,
    });

    return true;
  } catch {
    return false;
  }
};

export { cancelTicketOrder };
