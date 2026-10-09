import { atLeastOneFieldUpdated } from "@/shared/utils";
import { notificationPreferencesSchema } from "./notificationSchemas";

const updateNotificationPreferencesSchema = notificationPreferencesSchema.partial().refine(
  (notification) => {
    return atLeastOneFieldUpdated(notification);
  },

  { message: "Para validar a edição, altere pelo menos um dos campos." },
);

export { updateNotificationPreferencesSchema };
