import { fn } from "storybook/test";
import { useState } from "react";
import type { NotificationProps } from "@/features/users/notifications/types/notification";

const fakeNotifications: NotificationProps[] = [
  {
    id: "id-da-notificacao-fake-1",
    type: "new_event",
    title: "Novo evento na agenda",
    message: "Evento Fake 01 com Atração Fake 01 já está na agenda.",
    readAt: null,

    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },

  {
    id: "id-da-notificacao-fake-2",
    type: "order_cancelled",
    title: "Pedido cancelado",
    message: "O seu pedido #1A2B3C4D (Evento Fake 02) foi cancelado.",
    readAt: null,

    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },

  {
    id: "id-da-notificacao-fake-3",
    type: "new_event",
    title: "Novo evento na agenda",
    message: "Evento Fake 03 com Atração Fake 02 já está na agenda.",
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),

    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
];

const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>(fakeNotifications);

  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  return {
    notifications,
    unreadCount,
    isLoading: false,
    error: null,

    markSingleNotificationAsReadMutation: fn(async (notificationId: string) => {
      setNotifications((current) =>
        current.map((notification) => (notification.id === notificationId ? { ...notification, readAt: new Date().toISOString() } : notification)),
      );

      return true;
    }),

    markAllNotificationsAsReadMutation: fn(async () => {
      setNotifications((current) => current.map((notification) => ({ ...notification, readAt: notification.readAt ?? new Date().toISOString() })));

      return true;
    }),
  };
};

export { useNotifications, fakeNotifications };
