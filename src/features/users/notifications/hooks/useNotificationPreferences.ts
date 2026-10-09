"use client";

import { getNotificationPreferences, updateNotificationPreferences as updateNotificationPreferencesAction } from "@/actions/";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useNotificationPreferences = () => {
  const queryClient = useQueryClient();

  /* - Puxando do context - */

  const { isAuthenticated } = useAuthenticationContext();

  /* - Query de leitura - */

  const { data, isLoading, error } = useQuery({
    queryKey: ["notificationPreferences"],
    queryFn: getNotificationPreferences,
    enabled: isAuthenticated,
    staleTime: 60 * 10 * 1000,
    refetchOnWindowFocus: false,
  });

  /* - Definições - */

  const preferences = data && typeof data === "object" ? data : undefined;

  /* - Mutations - */

  // 1. UpdateNotificationPreferencesMutation

  const { mutateAsync: updateNotificationPreferencesMutation } = useMutation({
    mutationFn: updateNotificationPreferencesAction,
    onSuccess: (updateNotificationPreferencesMutationResult) => {
      if (updateNotificationPreferencesMutationResult) {
        queryClient.setQueryData(["notificationPreferences"], updateNotificationPreferencesMutationResult);
      }
    },
  });

  return {
    /* - Query de leitura - */

    preferences,
    isLoading,
    error,

    /* - Mutations - */

    updateNotificationPreferencesMutation,
  };
};

export { useNotificationPreferences };
