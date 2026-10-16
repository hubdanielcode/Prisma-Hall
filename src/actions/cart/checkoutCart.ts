"use server";

import { checkoutCartSchema } from "@/lib/validations/cart/cartItemSchemas";
import { getEventStatus } from "@/lib/server/events/getEventStatus";
import { getResend } from "@/lib/server/services/resend";
import { OrderConfirmationEmail } from "@/shared/emails/OrderConfirmationEmail";
import { prisma } from "@/lib/server/services/prisma";
import { serviceFee } from "@/features/cart/utils/serviceFee";
import { validateSession } from "@/actions/session/validateSession";
import React from "react";
import type { ItemType } from "@/prisma/generated/prisma/enums";
import z from "zod";

interface OrderItemProps {
  type: ItemType;
  name: string;
  quantity: number;
  unitPrice: number;
}

const checkoutCart = async (checkout: z.infer<typeof checkoutCartSchema>) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedCheckout = checkoutCartSchema.safeParse(checkout);

  if (!parsedCheckout.success) {
    return false;
  }

  const transactionWithServiceFee = (subtotal: number) => Math.round(subtotal * (1 + serviceFee) * 100) / 100;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  try {
    const orderSummary = await prisma.$transaction(async (transaction) => {
      const cartItems = await transaction.cart.findMany({
        where: { userId: validSession.user.id },
        include: { product: true, event: true },
      });

      if (cartItems.length === 0) {
        throw new Error("Carrinho vazio.");
      }

      const ticketItems = cartItems.filter((item) => item.type === "tickets");
      const drinkItems = cartItems.filter((item) => item.type === "drinks");

      let ticketOrderId: string | null = null;
      let ticketPaymentId: string | undefined;
      let voucherOrderId: string | null = null;
      let voucherPaymentId: string | undefined;

      let ordersTotalValue = 0;

      const orderItems: OrderItemProps[] = [];

      /* - Pedido de ingressos - */

      if (ticketItems.length > 0) {
        let ticketsSubtotal = 0;

        ticketItems.forEach((ticketItem) => {
          if (!ticketItem.event || getEventStatus(ticketItem.event) !== "soon") {
            throw new Error("Evento indisponível.");
          }

          ticketsSubtotal += ticketItem.event.price.toNumber() * ticketItem.quantity;
        });

        const ticketsTotalValue = transactionWithServiceFee(ticketsSubtotal);

        const newTicketOrder = await transaction.ticketOrder.create({
          data: {
            userId: validSession.user.id,
            status: "pending",

            tickets: {
              create: ticketItems.map((ticketItem) => ({
                userId: validSession.user.id,
                eventId: ticketItem.event!.id,
                quantity: ticketItem.quantity,
                unitPrice: ticketItem.event!.price,
              })),
            },

            ticketPayments: {
              create: {
                userId: validSession.user.id,
                method: parsedCheckout.data.method,
                status: "pending",
                totalValue: ticketsTotalValue,
              },
            },
          },
          include: { ticketPayments: true },
        });

        ticketOrderId = newTicketOrder.id;
        ticketPaymentId = newTicketOrder.ticketPayments[0].id;

        ordersTotalValue += ticketsTotalValue;

        orderItems.push(
          ...ticketItems.map((ticketItem) => ({
            type: ticketItem.type,
            name: ticketItem.event!.title,
            quantity: ticketItem.quantity,
            unitPrice: ticketItem.event!.price.toNumber(),
          })),
        );
      }

      /* - Pedido de vouchers - */

      if (drinkItems.length > 0) {
        let drinksSubtotal = 0;

        for (const drinkItem of drinkItems) {
          if (!drinkItem.product || drinkItem.product.status !== "active") {
            throw new Error("Produto indisponível.");
          }

          const stockUpdate = await transaction.product.updateMany({
            where: { id: drinkItem.product.id, quantity: { gte: drinkItem.quantity } },
            data: { quantity: { decrement: drinkItem.quantity } },
          });

          if (stockUpdate.count === 0) {
            throw new Error("Estoque insuficiente.");
          }

          drinksSubtotal += drinkItem.product.price.toNumber() * drinkItem.quantity;
        }

        const drinksTotalValue = transactionWithServiceFee(drinksSubtotal);

        const newVoucherOrder = await transaction.voucherOrder.create({
          data: {
            userId: validSession.user.id,
            status: "pending",

            vouchers: {
              create: drinkItems.map((item) => ({
                userId: validSession.user.id,
                productId: item.product!.id,
                quantity: item.quantity,
                unitPrice: item.product!.price,
              })),
            },

            voucherPayments: {
              create: {
                userId: validSession.user.id,
                method: parsedCheckout.data.method,
                status: "pending",
                totalValue: drinksTotalValue,
              },
            },
          },
          include: { voucherPayments: true },
        });

        voucherOrderId = newVoucherOrder.id;
        voucherPaymentId = newVoucherOrder.voucherPayments[0].id;

        ordersTotalValue += drinksTotalValue;

        orderItems.push(
          ...drinkItems.map((drinkItem) => ({
            type: drinkItem.type,
            name: drinkItem.product!.name,
            quantity: drinkItem.quantity,
            unitPrice: drinkItem.product!.price.toNumber(),
          })),
        );
      }

      /* - Esvazia o carrinho depois que os pedidos foram criados - */

      await transaction.cart.deleteMany({ where: { userId: validSession.user.id } });

      return {
        ticketOrderId,
        ticketPaymentId,
        voucherOrderId,
        voucherPaymentId,
        orderItems,
        ordersTotalValue: Math.round(ordersTotalValue * 100) / 100,
      };
    });

    /* - Email de confirmação. Uma falha no envio não pode desfazer um pedido que já foi criado - */

    try {
      const resend = getResend();

      await resend.emails.send({
        from: "Prisma Hall <naoresponda@prismahall.com>",
        to: validSession.user.email,
        subject: "Recebemos o seu pedido no Prisma Hall",
        text: `Olá, ${validSession.user.name}! Recebemos o seu pedido. Acesse ${appUrl}/perfil para acompanhar.`,
        react: React.createElement(OrderConfirmationEmail, {
          name: validSession.user.name,

          // 1. Pedido com ingressos tem tela própria. Pedido só de bebidas fica no perfil

          link: orderSummary.ticketOrderId ? `${appUrl}/pedidos/${orderSummary.ticketOrderId}` : `${appUrl}/perfil`,
          totalValue: orderSummary.ordersTotalValue,
          items: orderSummary.orderItems,
        }),
      });
    } catch {
      // O pedido continua válido mesmo sem o email
    }

    return {
      ticketOrderId: orderSummary.ticketOrderId,
      ticketPaymentId: orderSummary.ticketPaymentId,
      voucherOrderId: orderSummary.voucherOrderId,
      voucherPaymentId: orderSummary.voucherPaymentId,
    };
  } catch {
    return false;
  }
};

export { checkoutCart };
