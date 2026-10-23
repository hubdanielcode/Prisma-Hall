import { useState } from "react";
import type { NotificationPreferencesProps } from "@/features/users/notifications/types/notificationPreferences";

const fakePreferences: NotificationPreferencesProps = {
  notifyFavoriteEvents: true,
  notifyPromotions: false,
  notifyByEmail: true,

  createdAt: new Date("2026-08-01").toISOString(),
  updatedAt: new Date("2026-08-01").toISOString(),
};

const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferencesProps>(fakePreferences);

  return {
    preferences,
    isLoading: false,
    error: null,

    updateNotificationPreferencesMutation: async (newPreferences: Partial<NotificationPreferencesProps>) => {
      const updatedPreferences = { ...preferences, ...newPreferences };

      setPreferences(updatedPreferences);

      return updatedPreferences;
    },
  };
};

export { useNotificationPreferences, fakePreferences };
