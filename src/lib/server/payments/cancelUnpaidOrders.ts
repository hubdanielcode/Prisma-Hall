import "server-only";
import { prisma } from "../services/prisma";

interface CancelUnpaidOrdersProps {
  ticketPaymentId?: string;
  voucherPaymentId?: string;
}

/* - Cancela o pagamento e o pedido correspondente. Pagamentos que não estão mais pendentes são ignorados - */

const cancelUnpaidOrders = async ({ ticketPaymentId, voucherPaymentId }: CancelUnpaidOrdersProps) => {
  try {
    await prisma.$transaction(async (transaction) => {
      /* - Pagamento dos ingressos - */

      if (ticketPaymentId) {
        const existingTicketPayment = await transaction.ticketPayment.findUnique({ where: { id: ticketPaymentId } });

        if (existingTicketPayment && existingTicketPayment.status === "pending") {
          // 1. O "where" com status pendente faz a troca valer só uma vez, mesmo que o cancelamento do usuário e o webhook aconteçam ao mesmo tempo

          const cancelledTicketPayment = await transaction.ticketPayment.updateMany({
            where: { id: existingTicketPayment.id, status: "pending" },
            data: { status: "cancelled" },
          });

          if (cancelledTicketPayment.count === 1) {
            await transaction.ticketOrder.update({
              where: { id: existingTicketPayment.orderId },
              data: { status: "cancelled" },
            });

            // 2. Os ingressos do pedido cancelado também saem de "active"

            await transaction.ticket.updateMany({
              where: { orderId: existingTicketPayment.orderId, status: "active" },
              data: { status: "cancelled" },
            });
          }
        }
      }

      /* - Pagamento dos vouchers - */

      if (voucherPaymentId) {
        const existingVoucherPayment = await transaction.voucherPayment.findUnique({ where: { id: voucherPaymentId } });

        // 1. Só cancela se ainda estiver pendente. Isso evita que o estoque reservado no pedido seja devolvido duas vezes.

        if (existingVoucherPayment && existingVoucherPayment.status === "pending") {
          const cancelledVoucherPayment = await transaction.voucherPayment.updateMany({
            where: { id: existingVoucherPayment.id, status: "pending" },
            data: { status: "cancelled" },
          });

          if (cancelledVoucherPayment.count === 1) {
            const cancelledVoucherOrder = await transaction.voucherOrder.update({
              where: { id: existingVoucherPayment.orderId },
              data: { status: "cancelled" },
              include: { vouchers: true },
            });

            // 2. Os vouchers do pedido cancelado também saem de "active"

            await transaction.voucher.updateMany({
              where: { orderId: existingVoucherPayment.orderId, status: "active" },
              data: { status: "cancelled" },
            });

            // 3. Devolve ao estoque o que foi reservado no checkout

            for (const voucher of cancelledVoucherOrder.vouchers) {
              await transaction.product.update({
                where: { id: voucher.productId },
                data: { quantity: { increment: voucher.quantity } },
              });
            }
          }
        }
      }
    });

    return true;
  } catch {
    return false;
  }
};

export { cancelUnpaidOrders };
