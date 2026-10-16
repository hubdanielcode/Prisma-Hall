"use client";

import { favoriteEvent as favoriteEventAction, getFavoriteEvents } from "@/actions";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useFavoriteEvents = () => {
  const queryClient = useQueryClient();

  /* - Puxando do context - */

  const { isAuthenticated } = useAuthenticationContext();

  /* - Query de leitura - */

  const { data, isLoading, error } = useQuery({
    queryKey: ["favorite-events"],
    queryFn: getFavoriteEvents,
    enabled: isAuthenticated,
  });

  /* - Definições - */

  const favoriteEvents = Array.isArray(data) ? data : [];
  const favoriteEventIds = new Set(favoriteEvents.map((favoriteEvent) => favoriteEvent.id));

  /* - Mutations - */

  // 1. FavoriteEventMutation

  const { mutateAsync: favoriteEventMutation } = useMutation({
    mutationFn: favoriteEventAction,
    onSuccess: async (favoriteEventMutationResult) => {
      if (favoriteEventMutationResult) {
        await queryClient.invalidateQueries({ queryKey: ["favorite-events"] });
      }
    },
  });

  return {
    /* - Query de leitura - */

    favoriteEvents,
    favoriteEventIds,
    isLoading,
    error,

    /* - Mutations - */

    favoriteEventMutation,
  };
};

export { useFavoriteEvents };
