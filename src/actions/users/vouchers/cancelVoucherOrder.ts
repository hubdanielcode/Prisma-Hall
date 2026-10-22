"use server";

import { expireStripeCheckoutSessions, notifyUsersByEmail, prisma, refundStripePayment, retryOnFailure } from "@/lib/server";
import { orderIdSchema } from "@/lib/validations/users/orderIdSchema";
import { validateSession } from "../../authentication/validateSession";

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

    /* - Pedido já cancelado não pode ser cancelado de novo - */

    if (order.status === "cancelled") {
      return false;
    }

    /* - Pedido com retirada registrada não pode mais ser cancelado - */

    if (order.voucherPayments.some((payment) => payment.pickedUpAt)) {
      return false;
    }

    /* - Pagamento pendente no Stripe: as sessões de checkout abertas são expiradas ANTES de qualquer alteração, para o pedido cancelado não poder mais ser pago. Se uma sessão já foi paga, o pagamento está entrando e o cancelamento espera ele ser confirmado - */

    const pendingStripePayments = order.voucherPayments.filter((payment) => payment.status === "pending" && payment.method !== "cash");

    for (const payment of pendingStripePayments) {
      const expiredSessions = await expireStripeCheckoutSessions(payment.id, payment.createdAt);

      if (!expiredSessions) {
        return false;
      }
    }

    /* - O reembolso no Stripe acontece com pagamentos que ainda estão marcados como "confirmed". Se falhar, o pedido continua como estava e o usuário pode tentar novamente - */

    const confirmedPayment = order.voucherPayments.filter((payment) => payment.status === "confirmed");

    for (const payment of confirmedPayment) {
      const refundedPayment = await refundStripePayment({ paymentId: payment.id, type: "drinks" });

      if (!refundedPayment) {
        return false;
      }
    }

    /* - O dinheiro já voltou, então o banco precisa refletir isso. A transaction é repetida se falhar e, se ainda assim não der, repetir o cancelamento conclui a operação: o reembolso é idempotente - */

    try {
      await retryOnFailure(() =>
        prisma.$transaction(async (transaction) => {
          // 1. Pagamentos primeiro, na mesma ordem do cancelUnpaidOrders, para o webhook e o cancelamento do usuário não travarem um ao outro

          await transaction.voucherPayment.updateMany({ where: { orderId: order.id, status: "confirmed" }, data: { status: "refunded" } });
          await transaction.voucherPayment.updateMany({ where: { orderId: order.id, status: "pending" }, data: { status: "failed" } });

          // 2. Só cancela se o pedido ainda não estiver cancelado (protege contra duas chamadas ao mesmo tempo). Quem muda o status é quem devolve o estoque, então ele nunca volta duas vezes

          const cancelledOrder = await transaction.voucherOrder.updateMany({
            where: { id: order.id, status: { not: "cancelled" } },
            data: { status: "cancelled" },
          });

          if (cancelledOrder.count === 0) {
            return;
          }

          // 3. Os vouchers do pedido cancelado também saem de "active"

          await transaction.voucher.updateMany({ where: { orderId: order.id, status: "active" }, data: { status: "cancelled" } });

          // 4. Devolve ao estoque o que foi reservado no checkout

          for (const voucher of order.vouchers) {
            await transaction.product.update({ where: { id: voucher.productId }, data: { quantity: { increment: voucher.quantity } } });
          }
        }),
      );
    } catch (error) {
      if (confirmedPayment.length > 0) {
        console.error(
          `Reembolso feito no Stripe, mas o pedido ${order.id} não foi cancelado no banco. Repetir o cancelamento conclui a operação.`,
          error,
        );
      }

      throw error;
    }

    /* - O pedido já está cancelado. Avisar o usuário é consequência, e uma falha nisso não pode fazer a ação devolver erro - */

    try {
      await notifyUsersByEmail([validSession.user.id], {
        type: "order_cancelled",
        title: "Pedido cancelado",
        message: `O seu pedido de vouchers #${order.id.slice(0, 8).toUpperCase()} foi cancelado.`,
      });
    } catch (error) {
      console.error(`Falha ao notificar o cancelamento do pedido ${order.id}`, error);
    }

    return true;
  } catch {
    return false;
  }
};

export { cancelVoucherOrder };
