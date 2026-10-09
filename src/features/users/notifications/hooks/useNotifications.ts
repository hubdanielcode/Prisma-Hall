"use client";

import {
  getMyNotifications,
  markAllNotificationsAsRead as markAllNotificationsAsReadAction,
  markSingleNotificationAsRead as markSingleNotificationAsReadAction,
} from "@/actions";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useNotifications = () => {
  const queryClient = useQueryClient();

  /* - Puxando do context - */

  const { isAuthenticated } = useAuthenticationContext();

  /* - Query de leitura - */

  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: getMyNotifications,
    enabled: isAuthenticated,
    refetchInterval: 60 * 1000,
  });

  /* - Definições - */

  const notifications = Array.isArray(data) ? data : [];
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  /* - Mutations - */

  // 1. MarkSingleNotificationAsReadMutation

  const { mutateAsync: markSingleNotificationAsReadMutation } = useMutation({
    mutationFn: markSingleNotificationAsReadAction,
    onSuccess: async (markSingleNotificationAsReadMutationResult) => {
      if (markSingleNotificationAsReadMutationResult) {
        await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    },
  });

  // 2. MarkAllNotificationsAsReadMutation

  const { mutateAsync: markAllNotificationsAsReadMutation } = useMutation({
    mutationFn: markAllNotificationsAsReadAction,
    onSuccess: async (markAllNotificationsAsReadMutationResult) => {
      if (markAllNotificationsAsReadMutationResult) {
        await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    },
  });

  return {
    /* - Query de leitura - */

    notifications,
    unreadCount,
    isLoading,
    error,

    /* - Mutations - */

    markSingleNotificationAsReadMutation,
    markAllNotificationsAsReadMutation,
  };
};

export { useNotifications };
