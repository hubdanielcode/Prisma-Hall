"use server";

import { orderIdSchema } from "@/lib/validations/users/orderSchemas";
import { prisma } from "@/lib/prisma";
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
      include: { tickets: { include: { event: true } } },
    });

    if (!order || order.userId !== validSession.user.id) {
      return false;
    }

    if (order.status === "cancelled" || order.tickets.some((ticket) => ticket.event.status === "happened")) {
      return false;
    }

    await prisma.$transaction([
      prisma.ticketOrder.update({ where: { id: order.id }, data: { status: "cancelled" } }),

      prisma.ticketPayment.updateMany({ where: { orderId: order.id, status: "confirmed" }, data: { status: "refunded" } }),
      prisma.ticketPayment.updateMany({ where: { orderId: order.id, status: "pending" }, data: { status: "failed" } }),
    ]);

    return true;
  } catch {
    return false;
  }
};

export { cancelTicketOrder };
