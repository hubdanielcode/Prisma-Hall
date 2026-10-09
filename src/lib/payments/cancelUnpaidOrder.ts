import { prisma } from "@/lib/prisma";

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
          await transaction.ticketPayment.update({
            where: { id: existingTicketPayment.id },
            data: { status: "cancelled" },
          });

          await transaction.ticketOrder.update({
            where: { id: existingTicketPayment.orderId },
            data: { status: "cancelled" },
          });
        }
      }

      /* - Pagamento dos vouchers - */

      if (voucherPaymentId) {
        const existingVoucherPayment = await transaction.voucherPayment.findUnique({ where: { id: voucherPaymentId } });

        // 1. Só cancela se ainda estiver pendente. Isso evita que o estoque reservado no pedido seja devolvido duas vezes.

        if (existingVoucherPayment && existingVoucherPayment.status === "pending") {
          await transaction.voucherPayment.update({
            where: { id: existingVoucherPayment.id },
            data: { status: "cancelled" },
          });

          const cancelledVoucherOrder = await transaction.voucherOrder.update({
            where: { id: existingVoucherPayment.orderId },
            data: { status: "cancelled" },
            include: { vouchers: true },
          });

          // 2. Devolve ao estoque o que foi reservado no checkout

          for (const voucher of cancelledVoucherOrder.vouchers) {
            await transaction.product.update({
              where: { id: voucher.productId },
              data: { quantity: { increment: voucher.quantity } },
            });
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
