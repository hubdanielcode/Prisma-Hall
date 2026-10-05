"use server";

import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";

const getShoppingHistory = async () => {
  const validSession = await validateSession();

  if (!validSession) {
    throw new Error("Acesso negado.");
  }

  try {
    const [ticketOrders, voucherOrders] = await Promise.all([
      prisma.ticketOrder.findMany({
        where: { userId: validSession.user.id },
        include: {
          tickets: { include: { event: true } },
          ticketPayments: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      }),

      prisma.voucherOrder.findMany({
        where: { userId: validSession.user.id },
        include: {
          vouchers: { include: { product: true } },
          voucherPayment: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      }),
    ]);

    /* - Pedidos de ingressos - */

    const ticketHistory = ticketOrders.map((order) => {
      const payment = order.ticketPayments[0];

      return {
        id: order.id,
        type: "tickets" as const,
        status: order.status,
        paymentMethod: payment ? payment.method : null,
        paymentStatus: payment ? payment.status : null,
        totalValue: payment
          ? payment.totalValue.toNumber()
          : order.tickets.reduce((total, ticket) => total + ticket.quantity * ticket.unitPrice.toNumber(), 0),

        items: order.tickets.map((ticket) => ({
          id: ticket.id,
          name: ticket.event.title,
          image: ticket.event.image,
          quantity: ticket.quantity,
          unitPrice: ticket.unitPrice.toNumber(),
        })),

        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      };
    });

    /* - Pedidos de vouchers - */

    const voucherHistory = voucherOrders.map((order) => {
      const payment = order.voucherPayment[0];

      return {
        id: order.id,
        type: "vouchers" as const,
        status: order.status,
        paymentMethod: payment ? payment.method : null,
        paymentStatus: payment ? payment.status : null,
        totalValue: payment
          ? payment.totalValue.toNumber()
          : order.vouchers.reduce((total, voucher) => total + voucher.quantity * voucher.product.price.toNumber(), 0),

        items: order.vouchers.map((voucher) => ({
          id: voucher.id,
          name: voucher.product.name,
          image: voucher.product.image,
          quantity: voucher.quantity,
          unitPrice: voucher.product.price.toNumber(),
        })),

        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      };
    });

    /* - Junta tudo em uma única lista, do mais recente para o mais antigo - */

    return [...ticketHistory, ...voucherHistory].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    throw new Error("Erro ao buscar histórico de compras.");
  }
};

export { getShoppingHistory };
