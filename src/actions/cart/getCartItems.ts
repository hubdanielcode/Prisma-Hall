"use server";

import { mapCartItem } from "@/features/cart/utils/mapCartItem";
import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";

const getCartItems = async () => {
  const validSession = await validateSession();

  if (!validSession) {
    throw new Error("Acesso negado.");
  }

  try {
    const cartItems = await prisma.cart.findMany({
      where: { userId: validSession.user.id },
      include: { product: true, event: true },
      orderBy: { createdAt: "asc" },
    });

    return cartItems.map(mapCartItem);
  } catch {
    throw new Error("Erro ao buscar itens do carrinho.");
  }
};

export { getCartItems };
