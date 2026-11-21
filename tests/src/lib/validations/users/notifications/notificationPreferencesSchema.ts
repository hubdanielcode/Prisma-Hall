import { z } from "zod";

const notificationPreferencesSchema = z.object({
  // 1. Notificações de eventos favoritos

  notifyFavoriteEvents: z.boolean(),

  // 2. Notificações de promoções

  notifyPromotions: z.boolean(),

  // 3. Notificações por email

  notifyByEmail: z.boolean(),
});

export { notificationPreferencesSchema };
