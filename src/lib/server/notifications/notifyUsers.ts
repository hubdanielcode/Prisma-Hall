import "server-only";
import { getResend } from "@/lib/server/services/resend";
import { prisma } from "@/lib/server/services/prisma";
import type { NotificationType } from "@/prisma/generated/prisma/enums";

interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
}

/* - Cria a notificação dentro do app e, para quem ativou o email, envia também por email - */

const notifyUsersByEmail = async (userIds: string[], payload: NotificationPayload) => {
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

/* - Notifica só quem ativou as notificações de promoções (excludedUserIds: quem já recebeu o aviso por outro caminho) - */

const notifyPromotionsByEmail = async (payload: NotificationPayload, excludedUserIds: string[] = []) => {
  try {
    const subscribers = await prisma.notificationPreference.findMany({
      where: { notifyPromotions: true, userId: { notIn: excludedUserIds } },
      select: { userId: true },
    });

    return await notifyUsersByEmail(
      subscribers.map((subscriber) => subscriber.userId),
      payload,
    );
  } catch {
    return false;
  }
};

/* - Busca os ids dos usuários que favoritaram o evento e ativaram as notificações de eventos favoritos - */

const getUserIdsThatFavoritedEvent = async (eventId: string) => {
  try {
    const favorites = await prisma.favoriteEvent.findMany({
      where: { eventId, user: { notificationPreferences: { is: { notifyFavoriteEvents: true } } } },
      select: { userId: true },
    });

    return favorites.map((favorite) => favorite.userId);
  } catch {
    return [];
  }
};

/* - Notifica só quem favoritou o evento e ativou as notificações de eventos favoritos - */

const notifyFavoriteEventByEmail = async (eventId: string, payload: NotificationPayload) => {
  const userIds = await getUserIdsThatFavoritedEvent(eventId);

  return await notifyUsersByEmail(userIds, payload);
};

export { notifyUsersByEmail, notifyPromotionsByEmail, getUserIdsThatFavoritedEvent, notifyFavoriteEventByEmail };
