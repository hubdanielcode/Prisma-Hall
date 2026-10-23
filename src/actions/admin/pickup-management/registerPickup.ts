"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { getPickupBlockReason } from "@/lib/server/orders/getPickupBlockReason";
import { prisma } from "@/lib/server";
import { registerPickupSchema } from "@/lib/validations/admin/pickup-management/registerPickupSchema";
import type { PickupBlockReason } from "@/lib/server/orders/getPickupBlockReason";
import type { PickupOrderType } from "@/features/admin/pickup-management/types/pickupOrder";

interface RegisterPickupInput {
  orderId: string;
  type: PickupOrderType;
}

/* - Retorna true quando a retirada foi registrada, o motivo do bloqueio (texto) quando não pode ser registrada, "order_not_found" para pedido inexistente e false para qualquer outra falha - */

const registerPickup = async (input: RegisterPickupInput): Promise<true | false | PickupBlockReason | "order_not_found"> => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedInput = registerPickupSchema.safeParse(input);

  if (!parsedInput.success) {
    return false;
  }

  const { orderId, type } = parsedInput.data;

  // 1. Lê o pedido e devolve o motivo do bloqueio (ou null quando a retirada pode ser registrada); undefined quando o pedido não existe

  const checkOrder = async () => {
    if (type === "tickets") {
      const order = await prisma.ticketOrder.findUnique({
        where: { id: orderId },
        select: { status: true, ticketPayments: { select: { status: true, pickedUpAt: true } } },
      });

      return order ? getPickupBlockReason(order.status, order.ticketPayments) : undefined;
    }

    const order = await prisma.voucherOrder.findUnique({
      where: { id: orderId },
      select: { status: true, voucherPayments: { select: { status: true, pickedUpAt: true } } },
    });

    return order ? getPickupBlockReason(order.status, order.voucherPayments) : undefined;
  };

  try {
    const blockReason = await checkOrder();

    if (blockReason === undefined) {
      return "order_not_found";
    }

    if (blockReason) {
      return blockReason;
    }

    /* - A marcação acontece em um único comando que só atinge pagamento confirmado, ainda não retirado e de pedido não cancelado. Duas retiradas ao mesmo tempo, ou um cancelamento no meio do caminho, não passam dois pelo filtro - */

    const where = { orderId, status: "confirmed" as const, pickedUpAt: null, order: { status: { not: "cancelled" as const } } };
    const data = { pickedUpAt: new Date() };

    const pickedUpPayments =
      type === "tickets" ? await prisma.ticketPayment.updateMany({ where, data }) : await prisma.voucherPayment.updateMany({ where, data });

    if (pickedUpPayments.count === 0) {
      // 2. Perdeu a disputa: relê o pedido para devolver o motivo real (já retirado ou cancelado no meio do caminho)

      const currentBlockReason = await checkOrder();

      return currentBlockReason ?? false;
    }

    return true;
  } catch {
    return false;
  }
};

export { registerPickup };
