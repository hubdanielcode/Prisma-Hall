"use server";

import { notifyUsersByEmail } from "@/lib/server/notifications/notifyUsers";
import { orderIdSchema } from "@/lib/validations/users/orderIdSchema";
import { prisma } from "@/lib/server/services/prisma";
import { refundStripePayment } from "@/lib/server/payments/refundStripePayment";
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
      include: { vouchers: true, voucherPayments: true },
    });

    if (!order || order.userId !== validSession.user.id) {
      return false;
    }

    /* - Pedido com retirada registrada não pode mais ser cancelado - */

    if (order.voucherPayments.some((payment) => payment.pickedUpAt)) {
      return false;
    }

    /* - O reembolso no Stripe acontece com pagamentos que ainda estão marcados como "confirmed". Se falhar, o pedido continua como estava e o usuário pode tentar novamente - */

    const confirmedPayment = order.voucherPayments.filter((payment) => payment.status === "confirmed");

    for (const payment of confirmedPayment) {
      const refundedPayment = await refundStripePayment({ paymentId: payment.id, type: "drinks" });

      if (!refundedPayment) {
        return false;
      }
    }

    /* - Só cancela se o pedido ainda não estiver cancelado (protege contra duas chamadas ao mesmo tempo) - */

    await prisma.$transaction(async (transaction) => {
      const cancelledOrder = await transaction.voucherOrder.updateMany({
        where: { id: order.id, status: { not: "cancelled" } },
        data: { status: "cancelled" },
      });

      if (cancelledOrder.count === 0) {
        throw new Error("Pedido já cancelado");
      }

      await transaction.voucherPayment.updateMany({ where: { orderId: order.id, status: "confirmed" }, data: { status: "refunded" } });
      await transaction.voucherPayment.updateMany({ where: { orderId: order.id, status: "pending" }, data: { status: "failed" } });

      /* - Devolve ao estoque o que foi reservado no checkout - */

      for (const voucher of order.vouchers) {
        await transaction.product.update({ where: { id: voucher.productId }, data: { quantity: { increment: voucher.quantity } } });
      }
    });

    /* - Avisa ao usuário que o pedido foi cancelado - */

    await notifyUsersByEmail([validSession.user.id], {
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
