"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/server/services/prisma";

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

    /* - Só grava a atividade quando a última gravação tem mais de 5 minutos, para não escrever no banco a cada chamada - */

    const activityUpdateInterval = 5 * 60 * 1000;

    if (Date.now() - session.lastActivityAt.getTime() > activityUpdateInterval) {
      await prisma.session.update({
        where: { id: session.id },
        data: {
          lastActivityAt: new Date(),
        },
      });
    }

    /* - Em 1% das vezes, apaga as sessões expiradas ou revogadas. O sorteio evita rodar essa limpeza a cada requisição - */

    if (Math.random() < 0.01) {
      await prisma.session.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { not: null } }],
        },
      });
    }

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
