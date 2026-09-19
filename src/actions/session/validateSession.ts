"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const validateSession = async () => {
  const cookieStore = await cookies();

  const validSessionCookie = cookieStore.get("validSession");

  if (!validSessionCookie) {
    return false;
  }

  try {
    const session = await prisma.session.findUnique({ where: { id: validSessionCookie.value } });

    if (!session || session.expiresAt < new Date() || session.revokedAt) {
      return false;
    }

    await prisma.session.update({
      where: { id: session.id },
      data: {
        lastActivityAt: new Date(),
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return false;
    } else {
      return { session, user };
    }
  } catch {
    return false;
  }
};

export { validateSession };
