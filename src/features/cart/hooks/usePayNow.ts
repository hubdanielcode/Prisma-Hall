"use client";

import { createStripeCheckoutSession } from "@/actions";
import { useMutation } from "@tanstack/react-query";

const usePayNow = () => {
  /* - Mutation - */

  // 1. CreateStripeCheckoutSessionMutation

  const { mutateAsync: createStripeCheckoutSessionMutation, isPending } = useMutation({
    mutationFn: createStripeCheckoutSession,
  });

  return {
    /* - Estado - */

    isPending,

    /* - Mutation - */

    createStripeCheckoutSessionMutation,
  };
};

export { usePayNow };
