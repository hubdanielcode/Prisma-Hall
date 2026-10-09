import { getResend } from "@/lib/resend";
import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/prisma/generated/prisma/enums";

interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
}

/* - Cria a notificação dentro do app e, para quem ativou o email, envia também por email - */

const notifyUsers = async (userIds: string[], payload: NotificationPayload) => {
  if (userIds.length === 0) {
    return false;
  }

  try {
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
      })),
    });

    const emailRecipients = await prisma.user.findMany({
      where: { id: { in: userIds }, notificationPreferences: { is: { notifyByEmail: true } } },
      select: { email: true },
    });

    if (emailRecipients.length > 0) {
      const resend = getResend();

      /* - Uma falha de envio de email não pode derrubar a notificação que já foi criada - */

      await Promise.allSettled(
        emailRecipients.map((recipient) =>
          resend.emails.send({
            from: "Prisma Hall <naoresponda@prismahall.com>",
            to: recipient.email,
            subject: payload.title,
            text: payload.message,
          }),
        ),
      );
    }

    return true;
  } catch {
    return false;
  }
};

/* - Notifica só quem ativou as notificações de promoções - */

const notifyPromotionSubscribers = async (payload: NotificationPayload) => {
  try {
    const subscribers = await prisma.notificationPreference.findMany({
      where: { notifyPromotions: true },
      select: { userId: true },
    });

    return await notifyUsers(
      subscribers.map((subscriber) => subscriber.userId),
      payload,
    );
  } catch {
    return false;
  }
};

export { notifyUsers, notifyPromotionSubscribers };
