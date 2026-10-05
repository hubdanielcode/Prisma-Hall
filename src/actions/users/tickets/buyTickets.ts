"use server";

import { buyTicketsSchema } from "@/lib/validations/users/orderSchemas";
import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";
import z from "zod";

const buyTickets = async (ticket: z.infer<typeof buyTicketsSchema>) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedTicket = buyTicketsSchema.safeParse(ticket);

  if (!parsedTicket.success) {
    return false;
  }

  try {
    const event = await prisma.event.findUnique({ where: { id: parsedTicket.data.eventId } });

    if (!event || event.status !== "soon") {
      return false;
    }

    const totalValue = event.price.toNumber() * parsedTicket.data.quantity;

    /* - Cria o pedido, o ingresso e o pagamento pendente de uma vez só - */

    const newOrder = await prisma.ticketOrder.create({
      data: {
        userId: validSession.user.id,
        status: "pending",
        tickets: {
          create: {
            userId: validSession.user.id,
            eventId: event.id,
            quantity: parsedTicket.data.quantity,
            unitPrice: event.price,
          },
        },

        ticketPayments: {
          create: {
            userId: validSession.user.id,
            method: parsedTicket.data.method,
            status: "pending",
            totalValue: totalValue,
          },
        },
      },

      include: { tickets: true, ticketPayments: true },
    });

    return {
      id: newOrder.id,
      status: newOrder.status,
      eventId: newOrder.tickets[0].eventId,
      quantity: newOrder.tickets[0].quantity,
      unitPrice: newOrder.tickets[0].unitPrice.toNumber(),
      method: newOrder.ticketPayments[0].method,
      paymentStatus: newOrder.ticketPayments[0].status,
      totalValue: newOrder.ticketPayments[0].totalValue.toNumber(),

      createdAt: newOrder.createdAt.toISOString(),
      updatedAt: newOrder.updatedAt.toISOString(),
    };
  } catch {
    return false;
  }
};

export { buyTickets };
