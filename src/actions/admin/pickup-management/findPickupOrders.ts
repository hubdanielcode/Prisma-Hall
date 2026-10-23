"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { findPickupOrdersSchema } from "@/lib/validations/admin/pickup-management/findPickupOrdersSchema";
import { getPickupBlockReason } from "@/lib/server/orders/getPickupBlockReason";
import { prisma } from "@/lib/server";
import type { PickupOrderProps, PickupOrderType } from "@/features/admin/pickup-management/types/pickupOrder";

interface FindPickupOrdersInput {
  query: string;
  type: PickupOrderType;
}

const findPickupOrders = async (input: FindPickupOrdersInput): Promise<PickupOrderProps[] | false> => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedInput = findPickupOrdersSchema.safeParse(input);

  if (!parsedInput.success) {
    return false;
  }

  const { query, type } = parsedInput.data;

  /* - O pedido é localizado pelo início do código ou pelo nome/e-mail do cliente. O resultado é limitado aos 10 pedidos mais recentes - */

  const where = {
    OR: [
      { id: { startsWith: query, mode: "insensitive" as const } },
      { user: { name: { contains: query, mode: "insensitive" as const } } },
      { user: { email: { contains: query, mode: "insensitive" as const } } },
    ],
  };

  // 1. Quando há pagamento confirmado ele é o que importa; senão, o mais recente mostra a situação do pedido

  const pickMainPayment = <T extends { status: string }>(payments: T[]) =>
    payments.find((payment) => payment.status === "confirmed") ?? payments[0] ?? null;

  try {
    if (type === "tickets") {
      const orders = await prisma.ticketOrder.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          tickets: { include: { event: { select: { title: true } } } },
          ticketPayments: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      return orders.map((order) => {
        const mainPayment = pickMainPayment(order.ticketPayments);

        return {
          id: order.id,
          type: "tickets" as const,
          status: order.status,

          user: { name: order.user.name, email: order.user.email },

          items: order.tickets.map((ticket) => ({ id: ticket.id, name: ticket.event.title, quantity: ticket.quantity })),

          payment: mainPayment
            ? {
                id: mainPayment.id,
                method: mainPayment.method,
                status: mainPayment.status,
                totalValue: mainPayment.totalValue.toNumber(),
                confirmedAt: mainPayment.confirmedAt ? mainPayment.confirmedAt.toISOString() : null,
                pickedUpAt: mainPayment.pickedUpAt ? mainPayment.pickedUpAt.toISOString() : null,
              }
            : null,

          blockReason: getPickupBlockReason(order.status, order.ticketPayments),

          createdAt: order.createdAt.toISOString(),
        };
      });
    }

    const orders = await prisma.voucherOrder.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        vouchers: { include: { product: { select: { name: true } } } },
        voucherPayments: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return orders.map((order) => {
      const mainPayment = pickMainPayment(order.voucherPayments);

      return {
        id: order.id,
        type: "vouchers" as const,
        status: order.status,

        user: { name: order.user.name, email: order.user.email },

        items: order.vouchers.map((voucher) => ({ id: voucher.id, name: voucher.product.name, quantity: voucher.quantity })),

        payment: mainPayment
          ? {
              id: mainPayment.id,
              method: mainPayment.method,
              status: mainPayment.status,
              totalValue: mainPayment.totalValue.toNumber(),
              confirmedAt: mainPayment.confirmedAt ? mainPayment.confirmedAt.toISOString() : null,
              pickedUpAt: mainPayment.pickedUpAt ? mainPayment.pickedUpAt.toISOString() : null,
            }
          : null,

        blockReason: getPickupBlockReason(order.status, order.voucherPayments),

        createdAt: order.createdAt.toISOString(),
      };
    });
  } catch {
    return false;
  }
};

export { findPickupOrders };
