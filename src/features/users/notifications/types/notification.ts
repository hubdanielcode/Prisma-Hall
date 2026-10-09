import type { NotificationType } from "@/prisma/generated/prisma/enums";

export interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  readAt: string | null;

  createdAt: string;
  updatedAt: string;
}
