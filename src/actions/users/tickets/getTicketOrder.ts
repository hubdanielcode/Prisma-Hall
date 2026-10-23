"use server";

import { getEventStatus, prisma } from "@/lib/server";
import { orderIdSchema } from "@/lib/validations/users/user/orderIdSchema";
import { validateSession } from "../../authentication/validateSession";
import type { TicketOrderProps } from "@/features/users/tickets/types/ticketOrder";

const getTicketOrder = async (orderId: string): Promise<TicketOrderProps | false> => {
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
      include: {
        tickets: { include: { event: { include: { attraction: { select: { name: true } } } } } },
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
          attractionName: ticket.event.attraction.name,
          image: ticket.event.image,
          status: getEventStatus(ticket.event),
          startsAt: ticket.event.startsAt.toISOString(),
        },
      })),

      payments: order.ticketPayments.map((payment) => ({
        id: payment.id,
        method: payment.method,
        status: payment.status,
        totalValue: payment.totalValue.toNumber(),
        confirmedAt: payment.confirmedAt ? payment.confirmedAt.toISOString() : null,
        pickedUpAt: payment.pickedUpAt ? payment.pickedUpAt.toISOString() : null,

        createdAt: payment.createdAt.toISOString(),
      })),

      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  } catch {
    return false;
  }
};

export { getTicketOrder };
