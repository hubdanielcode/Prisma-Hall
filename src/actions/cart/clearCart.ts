"use server";

import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";

const clearCart = async () => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  try {
    await prisma.cart.deleteMany({ where: { userId: validSession.user.id } });

    return true;
  } catch {
    return false;
  }
};

export { clearCart };
