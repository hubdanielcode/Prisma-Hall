"use server";

import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "../../authentication/validateSession";

const getMyNotifications = async () => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: validSession.user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      readAt: notification.readAt ? notification.readAt.toISOString() : null,

      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    }));
  } catch {
    throw new Error("Erro ao buscar notificações.");
  }
};

export { getMyNotifications };
