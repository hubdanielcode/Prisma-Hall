"use client";

import { usePayNow } from "@/features/cart/hooks/usePayNow";
import { useState } from "react";
import { motion } from "motion/react";

interface PayNowButtonProps {
  type: "tickets" | "drinks";
  orderId: string;
}

const PayNowButton = ({ type, orderId }: PayNowButtonProps) => {
  /* - Puxando do hook - */

  const { isPending, createStripeCheckoutSessionMutation } = usePayNow();

  /* - Estados de erro - */

  const [errorMessage, setErrorMessage] = useState<string>("");

  /* - Funções - */

  // 1. Abre o pagamento no Stripe para um pedido que já existe

  const handlePayNow = async () => {
    setErrorMessage("");

    try {
      const url = await createStripeCheckoutSessionMutation(type === "tickets" ? { ticketOrderId: orderId } : { voucherOrderId: orderId });

      if (url) {
        window.location.href = url;
        return;
      }

      setErrorMessage("Não foi possível abrir o pagamento. Tente novamente.");
    } catch {
      setErrorMessage("Não foi possível abrir o pagamento. Tente novamente.");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <motion.button
        className="flex justify-center px-4 py-2 text-[#B8860B] font-semibold bg-[#3D2B0A] hover:bg-[#7A5A08] backdrop-blur-sm border border-[#B8860B] rounded-lg gap-2 cursor-pointer hover:shadow-sm shadow-[#DDAE56] disabled:opacity-50 disabled:cursor-not-allowed"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        type="button"
        disabled={isPending}
        onClick={handlePayNow}
      >
        {isPending ? "Abrindo pagamento..." : "Pagar agora"}
      </motion.button>

      {errorMessage ? <span className="text-red-400 text-sm">{errorMessage}</span> : null}
    </div>
  );
};

export { PayNowButton };
