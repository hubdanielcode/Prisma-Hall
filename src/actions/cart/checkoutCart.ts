"use server";

import { checkoutCartSchema } from "@/lib/validations/cart/cartItemSchemas";
import { getResend } from "@/lib/resend";
import { OrderConfirmationEmail } from "@/shared/emails/OrderConfirmationEmail";
import { prisma } from "@/lib/prisma";

import { validateSession } from "@/actions/session/validateSession";
import React from "react";
import z from "zod";
import { serviceFee } from "@/features/cart/utils/serviceFee";
import type { ItemType } from "@/prisma/generated/prisma/enums";

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
    const result = await prisma.$transaction(async (transaction) => {
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
      let voucherOrderId: string | null = null;

      const orderItems: OrderItemProps[] = [];
      let ordersTotalValue = 0;

      /* - Pedido de ingressos - */

      if (ticketItems.length > 0) {
        let ticketsSubtotal = 0;

        ticketItems.forEach((ticketItem) => {
          if (!ticketItem.event || ticketItem.event.status !== "soon") {
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
        });

        ticketOrderId = newTicketOrder.id;

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
              })),
            },

            voucherPayment: {
              create: {
                userId: validSession.user.id,
                method: parsedCheckout.data.method,
                status: "pending",
                totalValue: drinksTotalValue,
              },
            },
          },
        });

        voucherOrderId = newVoucherOrder.id;

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

      return { ticketOrderId, voucherOrderId, orderItems, ordersTotalValue: Math.round(ordersTotalValue * 100) / 100 };
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

          link: result.ticketOrderId ? `${appUrl}/pedidos/${result.ticketOrderId}` : `${appUrl}/perfil`,
          totalValue: result.ordersTotalValue,
          items: result.orderItems,
        }),
      });
    } catch {
      // O pedido continua válido mesmo sem o email
    }

    return { ticketOrderId: result.ticketOrderId, voucherOrderId: result.voucherOrderId };
  } catch {
    return false;
  }
};

export { checkoutCart };
