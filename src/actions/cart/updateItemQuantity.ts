"use server";

import { mapCartItem } from "@/features/cart/utils/mapCartItem";
import { prisma } from "@/lib/prisma";
import { updateCartItemSchema } from "@/lib/validations/cart/updateCartItemSchema";
import { validateSession } from "@/actions/session/validateSession";
import z from "zod";

const updateItemQuantity = async (item: z.infer<typeof updateCartItemSchema>) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedItem = updateCartItemSchema.safeParse(item);

  if (!parsedItem.success || parsedItem.data.quantity === undefined) {
    return false;
  }

  try {
    const existingItem = await prisma.cart.findUnique({
      where: { id: parsedItem.data.cartItemId },
      include: { product: true, event: true },
    });

    if (!existingItem || existingItem.userId !== validSession.user.id) {
      return false;
    }

    /* - Se o item for uma bebida - */

    if (existingItem.type === "drinks") {
      if (!existingItem.product || existingItem.product.status !== "active") {
        return false;
      }

      // 1. Bebida não pode passar do estoque

      if (parsedItem.data.quantity > existingItem.product.quantity) {
        return false;
      }
    }

    /* - Se o item for um ingresso - */

    if (existingItem.type === "tickets") {
      if (!existingItem.event || existingItem.event.status !== "soon") {
        return false;
      }
    }

    const editedItem = await prisma.cart.update({
      where: { id: existingItem.id },
      data: {
        quantity: parsedItem.data.quantity,
        price: existingItem.product ? existingItem.product.price : existingItem.event!.price,
      },
      include: { product: true, event: true },
    });

    return mapCartItem(editedItem);
  } catch {
    return false;
  }
};

export { updateItemQuantity };
