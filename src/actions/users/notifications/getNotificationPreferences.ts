"use server";

import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";

const getNotificationPreferences = async () => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  try {
    /* - Se o usuário ainda não tem preferências salvas, cria com os valores padrão (tudo desligado) - */

    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: validSession.user.id },
      update: {},
      create: { userId: validSession.user.id },
    });

    return {
      notifyFavoriteEvents: preferences.notifyFavoriteEvents,
      notifyPromotions: preferences.notifyPromotions,
      notifyByEmail: preferences.notifyByEmail,

      createdAt: preferences.createdAt.toISOString(),
      updatedAt: preferences.updatedAt.toISOString(),
    };
  } catch {
    throw new Error("Erro ao buscar preferências de notificação.");
  }
};

export { getNotificationPreferences };
