"use server";

import { notificationIdSchema } from "@/lib/validations/users/notificationSchemas";
import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";

const markSingleNotificationAsRead = async (notificationId: string) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedNotificationId = notificationIdSchema.safeParse(notificationId);

  if (!parsedNotificationId.success) {
    return false;
  }

  try {
    await prisma.notification.updateMany({
      where: { id: parsedNotificationId.data, userId: validSession.user.id, readAt: null },
      data: { readAt: new Date() },
    });

    return true;
  } catch {
    return false;
  }
};

export { markSingleNotificationAsRead };
