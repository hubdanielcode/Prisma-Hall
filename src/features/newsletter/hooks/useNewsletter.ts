"use client";

import { getMySubscription } from "@/actions/newsletter/getMySubscription";
import { subscribeToNewsletter as subscribeToNewsletterAction } from "@/actions";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useNewsletter = () => {
  const queryClient = useQueryClient();

  /* - Puxando do context - */

  const { isAuthenticated } = useAuthenticationContext();

  /* - Query de leitura - */

  const { data: isSubscribed, isLoading, error } = useQuery({ queryKey: ["newsletter"], queryFn: getMySubscription, enabled: isAuthenticated });

  /* - Mutations - */

  // 1. SubscribeToNewsletterMutation

  const { mutateAsync: subscribeToNewsletterMutation, isPending: isSubscribing } = useMutation({
    mutationFn: subscribeToNewsletterAction,
    onSuccess: async (subscribeToNewsletterMutationResult) => {
      if (subscribeToNewsletterMutationResult === true) {
        await queryClient.invalidateQueries({ queryKey: ["newsletter"] });
      }
    },
  });

  return {
    /* - Query de leitura - */

    isSubscribed,
    isLoading,
    error,

    /* - Mutations - */

    subscribeToNewsletterMutation,
    isSubscribing,
  };
};

export { useNewsletter };
