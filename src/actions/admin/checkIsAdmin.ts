"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const checkIsAdmin = async () => {
  const cookieStore = await cookies();
  const validSession = cookieStore.get("validSession");

  if (!validSession) {
    return false;
  } else {
    const session = await prisma.session.findUnique({ where: { id: validSession.value } });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return false;
    } else {
      const user = await prisma.user.findUnique({ where: { id: session.userId } });

      if (user?.role === "admin") {
        return true;
      } else {
        return false;
      }
    }
  }
};

export { checkIsAdmin };
