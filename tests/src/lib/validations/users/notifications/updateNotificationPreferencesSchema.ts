import { atLeastOneFieldUpdated } from "@/shared/utils/functions/atLeastOneFieldUpdated";
import { notificationPreferencesSchema } from "./notificationPreferencesSchema";

const updateNotificationPreferencesSchema = notificationPreferencesSchema.partial().refine(
  (notification) => {
    return atLeastOneFieldUpdated(notification);
  },

  { message: "Para validar a edição, altere pelo menos um dos campos." },
);

export { updateNotificationPreferencesSchema };
