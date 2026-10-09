"use server";

import { notifyUsers } from "@/lib/notifications/notifyUsers";
import { orderIdSchema } from "@/lib/validations/users/orderSchemas";
import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";

const cancelVoucherOrder = async (orderId: string) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedOrderId = orderIdSchema.safeParse(orderId);

  if (!parsedOrderId.success) {
    return false;
  }

  try {
    const order = await prisma.voucherOrder.findUnique({
      where: { id: parsedOrderId.data },
      include: { vouchers: true, voucherPayment: true },
    });

    if (!order || order.userId !== validSession.user.id) {
      return false;
    }

    if (order.status === "cancelled" || order.voucherPayment.some((payment) => payment.pickedUpAt)) {
      return false;
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.voucherOrder.update({ where: { id: order.id }, data: { status: "cancelled" } });

      await transaction.voucherPayment.updateMany({ where: { orderId: order.id, status: "confirmed" }, data: { status: "refunded" } });
      await transaction.voucherPayment.updateMany({ where: { orderId: order.id, status: "pending" }, data: { status: "failed" } });

      for (const voucher of order.vouchers) {
        await transaction.product.update({ where: { id: voucher.productId }, data: { quantity: { increment: voucher.quantity } } });
      }
    });

    /* - Avisa o usuário que o pedido foi cancelado - */

    await notifyUsers([validSession.user.id], {
      type: "order_cancelled",
      title: "Pedido cancelado",
      message: `O seu pedido de vouchers #${order.id.slice(0, 8).toUpperCase()} foi cancelado.`,
    });

    return true;
  } catch {
    return false;
  }
};

export { cancelVoucherOrder };
