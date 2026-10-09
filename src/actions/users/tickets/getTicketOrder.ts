"use server";

import { orderIdSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";
import type { TicketOrderProps } from "@/features/users/tickets/types/ticketOrder";

const getTicketOrder = async (orderId: string): Promise<TicketOrderProps | false> => {
  const validSession = await validateSession();

  if (!validSession) {
    throw new Error("Acesso negado.");
  }

  const parsedOrderId = orderIdSchema.safeParse(orderId);

  if (!parsedOrderId.success) {
    return false;
  }

  try {
    const order = await prisma.ticketOrder.findUnique({
      where: { id: parsedOrderId.data },
      include: {
        tickets: { include: { event: true } },
        ticketPayments: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!order || order.userId !== validSession.user.id) {
      return false;
    }

    return {
      id: order.id,
      status: order.status,

      tickets: order.tickets.map((ticket) => ({
        id: ticket.id,
        eventId: ticket.eventId,
        quantity: ticket.quantity,
        unitPrice: ticket.unitPrice.toNumber(),

        event: {
          id: ticket.event.id,
          title: ticket.event.title,
          tag: ticket.event.tag,
          attractionName: ticket.event.attractionName,
          image: ticket.event.image,
          status: ticket.event.status,
          startsAt: ticket.event.startsAt.toISOString(),
        },
      })),

      payments: order.ticketPayments.map((payment) => ({
        id: payment.id,
        method: payment.method,
        status: payment.status,
        totalValue: payment.totalValue.toNumber(),
        confirmedAt: payment.confirmedAt ? payment.confirmedAt.toISOString() : null,

        createdAt: payment.createdAt.toISOString(),
      })),

      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  } catch {
    throw new Error("Erro ao buscar pedido de ingressos.");
  }
};

export { getTicketOrder };
