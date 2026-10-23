"use client";

import { findPickupOrders, registerPickup as registerPickupAction } from "@/actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PickupOrderType } from "../types/pickupOrder";

const usePickup = (type: PickupOrderType, submittedQuery: string) => {
  const queryClient = useQueryClient();

  /* - Query de leitura - */

  // 1. A busca só acontece depois que o admin envia o texto, com pelo menos 3 caracteres (o mesmo mínimo da action)

  const { data, isLoading, error } = useQuery({
    queryKey: ["pickupOrders", type, submittedQuery],
    queryFn: () => findPickupOrders({ query: submittedQuery, type }),
    enabled: submittedQuery.length >= 3,
  });

  /* - Mutations - */

  // 1. RegisterPickupMutation. O resultado pode ser um motivo de bloqueio (texto), então só invalida quando for true. Além da lista do admin, a retirada muda o que o cliente vê nos pedidos dele

  const { mutateAsync: registerPickupMutation } = useMutation({
    mutationFn: registerPickupAction,
    onSuccess: async (registerPickupMutationResult) => {
      if (registerPickupMutationResult === true) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["pickupOrders"] }),
          queryClient.invalidateQueries({ queryKey: ["ticketOrder"] }),
          queryClient.invalidateQueries({ queryKey: ["voucherOrder"] }),
          queryClient.invalidateQueries({ queryKey: ["tickets"] }),
          queryClient.invalidateQueries({ queryKey: ["vouchers"] }),
        ]);
      }
    },
  });

  return {
    /* - Query de leitura - */

    orders: Array.isArray(data) ? data : [],
    isLoading,
    error: Boolean(error) || data === false,

    /* - Mutations - */

    registerPickupMutation,
  };
};

export { usePickup };
