import { prisma } from "@/lib/prisma";

interface MarkOrderAsPaidProps {
  ticketPaymentId?: string;
  voucherPaymentId?: string;
}

/* - Confirma o pagamento e o pedido correspondente. Pagamentos que não estão mais pendentes são ignorados - */

const markOrderAsPaid = async ({ ticketPaymentId, voucherPaymentId }: MarkOrderAsPaidProps) => {
  try {
    await prisma.$transaction(async (transaction) => {
      /* - Pagamento dos ingressos - */

      if (ticketPaymentId) {
        const existingTicketPayment = await transaction.ticketPayment.findUnique({ where: { id: ticketPaymentId } });

        if (existingTicketPayment && existingTicketPayment.status === "pending") {
          await transaction.ticketPayment.update({
            where: { id: existingTicketPayment.id },
            data: { status: "confirmed", confirmedAt: new Date() },
          });

          await transaction.ticketOrder.update({
            where: { id: existingTicketPayment.orderId },
            data: { status: "confirmed" },
          });
        }
      }

      /* - Pagamento dos vouchers - */

      if (voucherPaymentId) {
        const existingVoucherPayment = await transaction.voucherPayment.findUnique({ where: { id: voucherPaymentId } });

        if (existingVoucherPayment && existingVoucherPayment.status === "pending") {
          await transaction.voucherPayment.update({
            where: { id: existingVoucherPayment.id },
            data: { status: "confirmed" },
          });

          await transaction.voucherOrder.update({
            where: { id: existingVoucherPayment.orderId },
            data: { status: "confirmed" },
          });
        }
      }
    });

    return true;
  } catch {
    return false;
  }
};

export { markOrderAsPaid };
