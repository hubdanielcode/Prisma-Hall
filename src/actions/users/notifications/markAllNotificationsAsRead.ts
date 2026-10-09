"use server";

import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";

const markAllNotificationsAsRead = async () => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  try {
    await prisma.notification.updateMany({
      where: { userId: validSession.user.id, readAt: null },
      data: { readAt: new Date() },
    });

    return true;
  } catch {
    return false;
  }
};

export { markAllNotificationsAsRead };
