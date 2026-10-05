"use server";

import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";

const getMyTickets = async () => {
  const validSession = await validateSession();

  if (!validSession) {
    throw new Error("Acesso negado.");
  }

  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: validSession.user.id },
      include: {
        event: true,
        order: { include: { ticketPayments: { orderBy: { createdAt: "desc" }, take: 1 } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return tickets.map((ticket) => ({
      id: ticket.id,
      orderId: ticket.orderId,
      eventId: ticket.eventId,
      quantity: ticket.quantity,
      unitPrice: ticket.unitPrice.toNumber(),
      orderStatus: ticket.order.status,
      paymentStatus: ticket.order.ticketPayments[0]?.status ?? "pending",
      pickedUpAt: ticket.order.ticketPayments[0]?.pickedUpAt ? ticket.order.ticketPayments[0].pickedUpAt.toISOString() : null,

      event: {
        id: ticket.event.id,
        title: ticket.event.title,
        description: ticket.event.description,
        tag: ticket.event.tag,
        attractionName: ticket.event.attractionName,
        image: ticket.event.image,
        status: ticket.event.status,
        price: ticket.event.price.toNumber(),
        startsAt: ticket.event.startsAt.toISOString(),
        attendees: ticket.event.attendees,
        rating: ticket.event.rating.toNumber(),

        createdAt: ticket.event.createdAt.toISOString(),
        updatedAt: ticket.event.updatedAt.toISOString(),
      },

      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
    }));
  } catch {
    throw new Error("Erro ao buscar ingressos.");
  }
};

export { getMyTickets };
