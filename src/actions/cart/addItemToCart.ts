"use server";

import { cartItemSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";
import z from "zod";

const addItemToCart = async (cartItem: z.infer<typeof cartItemSchema>) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedCartItem = cartItemSchema.safeParse(cartItem);

  if (!parsedCartItem.success) {
    return false;
  }

  const productId = parsedCartItem.data.productId;
  const eventId = parsedCartItem.data.eventId;

  /* - Se o item for uma bebida - */

  try {
    if (parsedCartItem.data.type === "drinks") {
      if (!productId) {
        return false;
      }

      const product = await prisma.product.findUnique({ where: { id: productId } });

      if (!product || product.status !== "active") {
        return false;
      }

      const existingCartItem = await prisma.cart.findUnique({ where: { userId_productId: { userId: validSession.user.id, productId: product.id } } });

      if (existingCartItem) {
        // 1. Se a bebida já estiver no carrinho do usuário

        const newQuantity = existingCartItem.quantity + parsedCartItem.data.quantity;

        if (newQuantity > product.quantity) {
          return false;
        }

        const editedCartItem = await prisma.cart.update({
          where: { id: existingCartItem.id },
          data: { quantity: newQuantity, price: product.price },
        });

        return {
          id: editedCartItem.id,
          type: editedCartItem.type,
          productId: editedCartItem.productId,
          eventId: editedCartItem.eventId,
          quantity: editedCartItem.quantity,
          price: editedCartItem.price.toNumber(),

          product: {
            id: product.id,
            name: product.name,
            category: product.category,
            image: product.image,
            quantity: product.quantity,
            status: product.status,
          },

          event: null,

          createdAt: editedCartItem.createdAt.toISOString(),
          updatedAt: editedCartItem.updatedAt.toISOString(),
        };
      }

      // 2. Se a bebida ainda não estiver no carrinho do usuário

      if (parsedCartItem.data.quantity > product.quantity) {
        return false;
      }

      const newCartItem = await prisma.cart.create({
        data: {
          userId: validSession.user.id,
          productId: product.id,
          type: "drinks",
          quantity: parsedCartItem.data.quantity,
          price: product.price,
        },
      });

      return {
        id: newCartItem.id,
        type: newCartItem.type,
        productId: newCartItem.productId,
        eventId: newCartItem.eventId,
        quantity: newCartItem.quantity,
        price: newCartItem.price.toNumber(),

        product: {
          id: product.id,
          name: product.name,
          category: product.category,
          image: product.image,
          quantity: product.quantity,
          status: product.status,
        },

        event: null,

        createdAt: newCartItem.createdAt.toISOString(),
        updatedAt: newCartItem.updatedAt.toISOString(),
      };
    }
  } catch {
    return false;
  }

  /* - Se o item for um ingresso - */

  try {
    if (!eventId) {
      return false;
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event || event.status !== "soon") {
      return false;
    }

    const existingCartItem = await prisma.cart.findUnique({ where: { userId_eventId: { userId: validSession.user.id, eventId: event.id } } });

    if (existingCartItem) {
      // 1. Se o ingresso já estiver no carrinho do usuário

      const editedCartItem = await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + parsedCartItem.data.quantity, price: event.price },
      });

      return {
        id: editedCartItem.id,
        type: editedCartItem.type,
        productId: editedCartItem.productId,
        eventId: editedCartItem.eventId,
        quantity: editedCartItem.quantity,
        price: editedCartItem.price.toNumber(),

        product: null,

        event: {
          id: event.id,
          title: event.title,
          attractionName: event.attractionName,
          image: event.image,
          startsAt: event.startsAt.toISOString(),
          status: event.status,
        },

        createdAt: editedCartItem.createdAt.toISOString(),
        updatedAt: editedCartItem.updatedAt.toISOString(),
      };
    }

    // 2. Se o ingresso ainda não estiver no carrinho do usuário

    const newCartItem = await prisma.cart.create({
      data: {
        userId: validSession.user.id,
        eventId: event.id,
        type: "tickets",
        quantity: parsedCartItem.data.quantity,
        price: event.price,
      },
    });

    return {
      id: newCartItem.id,
      type: newCartItem.type,
      productId: newCartItem.productId,
      eventId: newCartItem.eventId,
      quantity: newCartItem.quantity,
      price: newCartItem.price.toNumber(),

      product: null,

      event: {
        id: event.id,
        title: event.title,
        attractionName: event.attractionName,
        image: event.image,
        startsAt: event.startsAt.toISOString(),
        status: event.status,
      },

      createdAt: newCartItem.createdAt.toISOString(),
      updatedAt: newCartItem.updatedAt.toISOString(),
    };
  } catch {
    return false;
  }
};

export { addItemToCart };
