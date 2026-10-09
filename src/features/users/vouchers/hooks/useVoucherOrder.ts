"use client";

import { cancelVoucherOrder as cancelVoucherOrderAction, getVoucherOrder } from "@/actions";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useVoucherOrder = (orderId: string) => {
  const queryClient = useQueryClient();

  /* - Puxando do context - */

  const { isAuthenticated } = useAuthenticationContext();

  /* - Query de leitura - */

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["voucherOrder", orderId],
    queryFn: () => getVoucherOrder(orderId),
    enabled: isAuthenticated,
  });

  /* - Mutations - */

  const { mutateAsync: cancelVoucherOrderMutation } = useMutation({
    mutationFn: cancelVoucherOrderAction,
    onSuccess: async (result) => {
      if (result) {
        await queryClient.invalidateQueries({
          queryKey: ["voucherOrder", orderId],
        });
      }
    },
  });

  return {
    order,
    isLoading,
    error,
    cancelVoucherOrderMutation,
  };
};

export { useVoucherOrder };
