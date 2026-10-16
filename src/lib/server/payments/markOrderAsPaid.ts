import "server-only";
import { getResend } from "@/lib/server/services/resend";
import { PaymentConfirmationEmail } from "@/shared/emails/PaymentConfirmationEmail";
import { prisma } from "@/lib/server/services/prisma";
import { recalculateUserBadges } from "@/lib/server/badges/achievementBadges";
import React from "react";
import type { ItemType, PaymentMethod } from "@/prisma/generated/prisma/enums";

interface MarkOrderAsPaidProps {
  ticketPaymentId?: string;
  voucherPaymentId?: string;
  stripeMethod?: PaymentMethod;
}

interface PaymentEmailItemProps {
  type: ItemType;
  name: string;
  quantity: number;
  unitPrice: number;
}

/* - O checkout do Stripe só oferece "cartão", então o usuário pode escolher crédito no site e pagar com um débito (ou o contrário). Se o método escolhido foi cartão, grava o tipo real que o Stripe informou depois do pagamento - */

const getRealMethodUpdate = (checkoutMethod: PaymentMethod, stripeMethod?: PaymentMethod) => {
  const isCard = checkoutMethod === "creditCard" || checkoutMethod === "debitCard";

  return stripeMethod && isCard ? { method: stripeMethod } : {};
};

/* - Email de pagamento confirmado. Uma falha aqui não pode desfazer um pagamento que já foi confirmado - */

const sendPaymentConfirmationEmail = async ({ ticketPaymentId, voucherPaymentId }: MarkOrderAsPaidProps) => {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    let paymentRecipient: { name: string; email: string } | undefined;
    let paymentMethod: React.ComponentProps<typeof PaymentConfirmationEmail>["method"] | undefined;
    let paymentOrderId: string | undefined;

    let totalValue = 0;

    const items: PaymentEmailItemProps[] = [];

    /* - Pagamento dos ingressos - */

    if (ticketPaymentId) {
      const ticketPayment = await prisma.ticketPayment.findUnique({
        where: { id: ticketPaymentId },
        include: { user: true, order: { include: { tickets: { where: { status: "active" }, include: { event: true } } } } },
      });

      if (ticketPayment) {
        paymentRecipient = ticketPayment.user;
        paymentMethod = ticketPayment.method;
        paymentOrderId = ticketPayment.orderId;

        totalValue += ticketPayment.totalValue.toNumber();

        items.push(
          ...ticketPayment.order.tickets.map((ticket) => ({
            type: "tickets" as const,
            name: ticket.event.title,
            quantity: ticket.quantity,
            unitPrice: ticket.unitPrice.toNumber(),
          })),
        );
      }
    }

    /* - Pagamento dos vouchers - */

    if (voucherPaymentId) {
      const voucherPayment = await prisma.voucherPayment.findUnique({
        where: { id: voucherPaymentId },
        include: { user: true, order: { include: { vouchers: { where: { status: "active" }, include: { product: true } } } } },
      });

      if (voucherPayment) {
        paymentRecipient = paymentRecipient ?? voucherPayment.user;
        paymentMethod = paymentMethod ?? voucherPayment.method;

        // 1. Pedido com ingressos tem tela própria, e a mesma rota atende o pedido de vouchers

        paymentOrderId = paymentOrderId ?? voucherPayment.orderId;

        totalValue += voucherPayment.totalValue.toNumber();

        items.push(
          ...voucherPayment.order.vouchers.map((voucher) => ({
            type: "drinks" as const,
            name: voucher.product.name,
            quantity: voucher.quantity,
            unitPrice: voucher.unitPrice.toNumber(),
          })),
        );
      }
    }

    if (!paymentRecipient || !paymentMethod || !paymentOrderId || items.length === 0) {
      return;
    }

    const resend = getResend();

    await resend.emails.send({
      from: "Prisma Hall <naoresponda@prismahall.com>",
      to: paymentRecipient.email,
      subject: "Pagamento confirmado no Prisma Hall",
      text: `Olá, ${paymentRecipient.name}! O pagamento do seu pedido foi confirmado. Acesse ${appUrl}/pedidos/${paymentOrderId} para ver os detalhes.`,
      react: React.createElement(PaymentConfirmationEmail, {
        name: paymentRecipient.name,
        link: `${appUrl}/pedidos/${paymentOrderId}`,
        totalValue: Math.round(totalValue * 100) / 100,
        method: paymentMethod,
        items,
      }),
    });
  } catch {
    // O pagamento continua confirmado mesmo sem o email
  }
};

/* - Confirma o pagamento e o pedido correspondente. Pagamentos que não estão mais pendentes são ignorados - */

const markOrderAsPaid = async ({ ticketPaymentId, voucherPaymentId, stripeMethod }: MarkOrderAsPaidProps) => {
  try {
    // 1. Quem acabou de ter o pedido de ingressos confirmado, pra recalcular o badge de frequência

    let confirmedTicketBuyerId: string | undefined;

    // 2. Só os pagamentos que passaram de pendente para confirmado agora recebem o email, assim o webhook repetido não duplica o envio

    let newlyConfirmedTicketPaymentId: string | undefined;
    let newlyConfirmedVoucherPaymentId: string | undefined;

    await prisma.$transaction(async (transaction) => {
      /* - Pagamento dos ingressos - */

      if (ticketPaymentId) {
        const existingTicketPayment = await transaction.ticketPayment.findUnique({ where: { id: ticketPaymentId } });

        if (existingTicketPayment && existingTicketPayment.status === "pending") {
          // 3. O "where" com status pendente faz a troca valer só pra uma entrega do webhook, mesmo que duas cheguem ao mesmo tempo

          const confirmedTicketPayment = await transaction.ticketPayment.updateMany({
            where: { id: existingTicketPayment.id, status: "pending" },
            data: { status: "confirmed", confirmedAt: new Date(), ...getRealMethodUpdate(existingTicketPayment.method, stripeMethod) },
          });

          if (confirmedTicketPayment.count === 1) {
            await transaction.ticketOrder.update({
              where: { id: existingTicketPayment.orderId },
              data: { status: "confirmed" },
            });

            confirmedTicketBuyerId = existingTicketPayment.userId;
            newlyConfirmedTicketPaymentId = existingTicketPayment.id;
          }
        }
      }

      /* - Pagamento dos vouchers - */

      if (voucherPaymentId) {
        const existingVoucherPayment = await transaction.voucherPayment.findUnique({ where: { id: voucherPaymentId } });

        if (existingVoucherPayment && existingVoucherPayment.status === "pending") {
          const confirmedVoucherPayment = await transaction.voucherPayment.updateMany({
            where: { id: existingVoucherPayment.id, status: "pending" },
            data: { status: "confirmed", confirmedAt: new Date(), ...getRealMethodUpdate(existingVoucherPayment.method, stripeMethod) },
          });

          if (confirmedVoucherPayment.count === 1) {
            await transaction.voucherOrder.update({
              where: { id: existingVoucherPayment.orderId },
              data: { status: "confirmed" },
            });

            newlyConfirmedVoucherPaymentId = existingVoucherPayment.id;
          }
        }
      }
    });

    /* - Se o badge falhar, o pagamento não está mais pendente e o webhook repetido não enviaria o email de novo - */

    if (newlyConfirmedTicketPaymentId || newlyConfirmedVoucherPaymentId) {
      await sendPaymentConfirmationEmail({
        ticketPaymentId: newlyConfirmedTicketPaymentId,
        voucherPaymentId: newlyConfirmedVoucherPaymentId,
      });
    }

    /* - Mais um evento participado pode subir o badge de frequência - */

    if (confirmedTicketBuyerId) {
      await recalculateUserBadges(confirmedTicketBuyerId);
    }

    return true;
  } catch {
    return false;
  }
};

export { markOrderAsPaid };
