"use client";

import {
  addItemToCart as addItemToCartAction,
  checkoutCart as checkoutCartAction,
  clearCart as clearCartAction,
  getCartItems,
  removeItemFromCart as removeItemFromCartAction,
  updateItemQuantity as updateItemQuantityAction,
} from "@/actions";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useCartItems = () => {
  const queryClient = useQueryClient();

  /* - Puxando do context - */

  const { isAuthenticated } = useAuthenticationContext();

  /* - Query de leitura - */

  const {
    data: cartItems,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cartItems"],
    queryFn: getCartItems,
    enabled: isAuthenticated,
  });

  /* - Mutations - */

  // 1. AddItemToCartMutation

  const { mutateAsync: addItemToCartMutation } = useMutation({
    mutationFn: addItemToCartAction,
    onSuccess: async (addItemToCartMutationResult) => {
      if (addItemToCartMutationResult) {
        queryClient.invalidateQueries({ queryKey: ["cartItems"] });
      }
    },
  });

  // 2. UpdateItemQuantityMutation

  const { mutateAsync: updateItemQuantityMutation } = useMutation({
    mutationFn: updateItemQuantityAction,
    onSuccess: async (updateItemQuantityMutationResult) => {
      if (updateItemQuantityMutationResult) {
        queryClient.invalidateQueries({ queryKey: ["cartItems"] });
      }
    },
  });

  // 3. RemoveItemFromCartMutation

  const { mutateAsync: removeItemFromCartMutation } = useMutation({
    mutationFn: removeItemFromCartAction,
    onSuccess: async (removeItemFromCartMutationResult) => {
      if (removeItemFromCartMutationResult) {
        queryClient.invalidateQueries({ queryKey: ["cartItems"] });
      }
    },
  });

  // 4. ClearCartMutation

  const { mutateAsync: clearCartMutation } = useMutation({
    mutationFn: clearCartAction,
    onSuccess: async (clearCartMutationResult) => {
      if (clearCartMutationResult) {
        queryClient.invalidateQueries({ queryKey: ["cartItems"] });
      }
    },
  });

  // 5. CheckoutCartMutation - Além do carrinho, o checkout mexe em ingressos, vouchers e no estoque dos produtos

  const { mutateAsync: checkoutCartMutation } = useMutation({
    mutationFn: checkoutCartAction,
    onSuccess: async (checkoutCartMutationResult) => {
      if (checkoutCartMutationResult) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["cartItems"] }),
          queryClient.invalidateQueries({ queryKey: ["tickets"] }),
          queryClient.invalidateQueries({ queryKey: ["vouchers"] }),
          queryClient.invalidateQueries({ queryKey: ["products"] }),
        ]);
      }
    },
  });

  return {
    /* - Query de leitura - */

    // 1. Sem sessão o carrinho é sempre vazio, mesmo que o cache ainda guarde itens do usuário anterior

    cartItems: isAuthenticated ? cartItems : undefined,
    isLoading,
    error,

    /* - Mutations - */

    addItemToCartMutation,
    updateItemQuantityMutation,
    removeItemFromCartMutation,
    clearCartMutation,
    checkoutCartMutation,
  };
};

export { useCartItems };
