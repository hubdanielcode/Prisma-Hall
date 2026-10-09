"use server";

import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";
import { cartItemIdSchema } from "@/lib/validations/cart/cartItemSchemas";

const removeItemFromCart = async (cartItemId: string) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedCartItemId = cartItemIdSchema.safeParse(cartItemId);

  if (!parsedCartItemId.success) {
    return false;
  }

  try {
    const existingItem = await prisma.cart.findUnique({ where: { id: parsedCartItemId.data } });

    if (!existingItem || existingItem.userId !== validSession.user.id) {
      return false;
    }

    await prisma.cart.delete({ where: { id: existingItem.id } });

    return true;
  } catch {
    return false;
  }
};

export { removeItemFromCart };
