"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useVoucherOrder } from "@/features/users/vouchers/hooks/useVoucherOrder";
import { VoucherOrderSummary } from "./VoucherOrderSummary";
import Link from "next/link";

interface CancelVoucherOrderProps {
  orderId: string;
}

const CancelVoucherOrder = ({ orderId }: CancelVoucherOrderProps) => {
  /* - Puxando do hook - */

  const { order, isLoading, error, cancelVoucherOrderMutation } = useVoucherOrder(orderId);

  /* - Estados de envio - */

  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  /* - Estados de erro - */

  const [cancelError, setCancelError] = useState<string>("");

  /* - Definições - */

  const router = useRouter();

  const isLoadingOrder = isLoading || (order === undefined && !error);

  // 1. Espelha a regra da action: só cancela pedido ainda não cancelado e sem voucher retirado

  const canCancel = order ? order.status !== "cancelled" && order.payments.every((payment) => !payment.pickedUpAt) : false;

  // 2. O que acontece com o pagamento depende do estado em que ele está

  const latestPaymentStatus = order ? order.payments[0]?.status : undefined;

  const paymentWarning =
    latestPaymentStatus === "confirmed"
      ? "O pagamento deste pedido será marcado como reembolsado."
      : latestPaymentStatus === "pending"
        ? "O pagamento pendente deste pedido será marcado como falho e não será cobrado."
        : "";

  /* - Funções - */

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCancelOrder = async () => {
    setCancelError("");
    setIsCancelling(true);

    try {
      const result = await cancelVoucherOrderMutation(orderId);

      if (!result) {
        setCancelError("Não foi possível cancelar o pedido. Tente novamente.");
        return;
      }

      router.replace(`/pedidos/${orderId}`);
    } catch {
      setCancelError("Não foi possível cancelar o pedido. Tente novamente.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full pt-32 pb-14 px-4 bg-[#1A1A1A]">
      <div className="flex flex-col w-full max-w-3xl gap-6">
        {/* - Título - */}

        <span className="text-white font-semibold text-2xl sm:text-3xl">Cancelar Pedido</span>

        {/* - Estados de carregamento e erro - */}

        {isLoadingOrder && <p className="text-white/60 text-center p-12">Carregando pedido...</p>}

        {!isLoadingOrder && error && <p className="text-red-500 text-center p-12">Erro ao buscar o pedido.</p>}

        {!isLoadingOrder && !error && order === false && <p className="text-white/60 text-center p-12">Pedido não encontrado.</p>}

        {/* - Conteúdo - */}

        {!isLoadingOrder && !error && order && (
          <>
            <VoucherOrderSummary order={order} />

            {/* - Pedido que não pode mais ser cancelado - */}

            {!canCancel && (
              <div className="flex flex-col gap-4 p-6 bg-black border border-[#B8860B] rounded-lg">
                <p className="text-white/60 text-sm">
                  {order.status === "cancelled"
                    ? "Este pedido já foi cancelado."
                    : "Este pedido não pode mais ser cancelado, pois um voucher já foi retirado."}
                </p>

                <Link
                  className="w-fit text-sm text-[#B8860B] hover:underline"
                  href={`/pedidos/${order.id}`}
                >
                  Voltar para o pedido
                </Link>
              </div>
            )}

            {/* - Confirmação - */}

            {canCancel && (
              <div className="flex flex-col gap-4 p-6 bg-black border border-[#B8860B] rounded-lg">
                <span className="text-white font-semibold text-lg">Tem certeza que deseja cancelar este pedido?</span>

                <p className="text-white/60 text-sm">Essa ação não pode ser desfeita. {paymentWarning}</p>

                <Link
                  className="w-fit text-sm text-[#B8860B] hover:underline"
                  href="/politica-de-reembolso"
                >
                  Consultar a política de reembolso
                </Link>

                {/* - Seção de erro - */}

                {cancelError && (
                  <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                    {cancelError}
                  </p>
                )}

                <div className="flex gap-3 ml-auto">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      className="flex items-center justify-center h-full px-4 py-2 text-sm font-semibold text-white bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#B8860B] rounded-lg"
                      href={`/pedidos/${order.id}`}
                    >
                      Manter Pedido
                    </Link>
                  </motion.div>

                  <motion.button
                    className="px-4 py-2 text-sm font-semibold text-white bg-red-500/20 border border-red-500 rounded-lg cursor-pointer hover:bg-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isCancelling}
                    onClick={handleCancelOrder}
                  >
                    {isCancelling ? "Cancelando..." : "Confirmar Cancelamento"}
                  </motion.button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export { CancelVoucherOrder };
