"use server";

import { prisma } from "@/lib/prisma";

import { updateNotificationPreferencesSchema } from "@/lib/validations/users/updateNotificationPreferencesSchema";
import { validateSession } from "@/actions/session/validateSession";
import z from "zod";

const updateNotificationPreferences = async (preferences: z.infer<typeof updateNotificationPreferencesSchema>) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedPreferences = updateNotificationPreferencesSchema.safeParse(preferences);

  if (!parsedPreferences.success) {
    return false;
  }

  const basePreferencesData = {
    notifyFavoriteEvents: parsedPreferences.data.notifyFavoriteEvents,
    notifyPromotions: parsedPreferences.data.notifyPromotions,
    notifyByEmail: parsedPreferences.data.notifyByEmail,
  };

  try {
    const editedPreferences = await prisma.notificationPreference.upsert({
      where: { userId: validSession.user.id },
      update: { ...basePreferencesData },
      create: { userId: validSession.user.id, ...basePreferencesData },
    });

    return {
      notifyFavoriteEvents: editedPreferences.notifyFavoriteEvents,
      notifyPromotions: editedPreferences.notifyPromotions,
      notifyByEmail: editedPreferences.notifyByEmail,

      createdAt: editedPreferences.createdAt.toISOString(),
      updatedAt: editedPreferences.updatedAt.toISOString(),
    };
  } catch {
    return false;
  }
};

export { updateNotificationPreferences };
