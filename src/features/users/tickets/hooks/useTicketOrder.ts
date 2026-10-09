"use client";

import { cancelTicketOrder as cancelTicketOrderAction, getTicketOrder } from "@/actions";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useTicketOrder = (orderId: string) => {
  const queryClient = useQueryClient();

  /* - Puxando do context - */

  const { isAuthenticated } = useAuthenticationContext();

  /* - Query de leitura - */

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ticketOrder", orderId],
    queryFn: () => getTicketOrder(orderId),
    enabled: isAuthenticated,
  });

  /* - Mutations - */

  // 1. CancelTicketOrderMutation

  const { mutateAsync: cancelTicketOrderMutation } = useMutation({
    mutationFn: cancelTicketOrderAction,
    onSuccess: async (cancelTicketOrderMutationResult) => {
      if (cancelTicketOrderMutationResult) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["ticketOrder", orderId] }),
          queryClient.invalidateQueries({ queryKey: ["tickets"] }),
        ]);
      }
    },
  });

  return {
    /* - Query de leitura - */

    order,
    isLoading,
    error,

    /* - Mutations - */

    cancelTicketOrderMutation,
  };
};

export { useTicketOrder };
