import { useState } from "react";

const usePayNow = () => {
  const [isPending, setIsPending] = useState<boolean>(false);

  const createStripeCheckoutSessionMutation = async () => {
    setIsPending(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setIsPending(false);

    return false as const;
  };

  return { isPending, createStripeCheckoutSessionMutation };
};

export { usePayNow };
